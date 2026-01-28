import asyncio
import json
import linecache
import logging
import sys
import threading

from aiohttp import WSMsgType

from . import config
from .debugger import (
    get_frame,
    get_title,
    serialize_answer,
    serialize_answer_recursive,
    serialize_diff_eval,
    serialize_exception,
    serialize_frames,
    serialize_inspect,
    serialize_inspect_eval,
    serialize_suggestion,
    serialize_table,
)
from .errors import SetFrameError
from .loops import get_loop
from .stepping import add_step, clear_step, stop_trace
from .utils import basicConfig, get_file_from_code
from .websockets import adie, die, websocket_state

log = logging.getLogger(__name__)
basicConfig(level=config.log_level)


def exception_handler(loop, context):
    logging.error(f"Loop exit: {context}")


def communicate(frame, event, arg, pending=None):
    loop = get_loop()

    loop.set_exception_handler(exception_handler)
    try:
        loop.run_until_complete(communication_loop(frame, event, arg, pending))
    except asyncio.CancelledError:
        log.info("Loop got cancelled")
        die()


async def init(ws, frame, event, arg):
    tb = arg[2] if event == "exception" else None

    await ws.send_json({"type": "SET_THEME", "theme": event})
    await ws.send_json({"type": "SET_TITLE", "title": get_title(frame, event, arg)})
    await ws.send_json(
        {
            "type": "SET_FRAMES",
            "frames": list(serialize_frames(frame, tb)) if event != "shell" else [],
        }
    )


async def handle_message(ws, data, frame, event, arg):
    tb = arg[2] if event == "exception" else None
    if data["type"] == "HELLO":
        await init(ws, frame, event, arg)
        response = {
            "type": "SET_INFO",
            "config": config.__dict__,
            "main": threading.current_thread() is threading.main_thread(),
        }

    elif data["type"] == "GET_FILE":
        filename = data["filename"]
        file = "".join(linecache.getlines(filename))
        if not file:
            file = get_file_from_code(frame, filename)
        response = {
            "type": "SET_FILE",
            "filename": filename,
            "source": file,
        }

    elif data["type"] == "SET_PROMPT" or data["type"] == "REFRESH_PROMPT":
        try:
            step_frame = get_frame(frame, data.get("frame"), tb)
            eval_fun = (
                serialize_inspect_eval
                if data.get("command") == "inspect"
                else serialize_diff_eval
                if data.get("command") == "diff"
                else serialize_table
                if data.get("command") == "table"
                else serialize_answer_recursive
                if data.get("command") == "recursive_debug"
                else serialize_answer
            )

            def get_response():
                return {
                    "type": "SET_ANSWER",
                    "key": data["key"],
                    "command": data.get("command"),
                    "frame": data.get("frame"),
                    **eval_fun(data["prompt"], step_frame),
                }

            if data.get("command") == "condition":
                add_step("continue", step_frame, condition=get_response)
                response = {
                    "type": "DO_COMMAND",
                    "command": "continue",
                    "frame": data.get("frame"),
                    "stop": True,
                }
            else:
                response = get_response()

        except SetFrameError as e:
            frame = e.frame
            event = e.event
            arg = e.arg

            await init(ws, frame, event, arg)

            response = {
                "type": "SET_ANSWER",
                "key": data["key"],
                "command": data.get("command"),
                "frame": data.get("frame"),
                "prompt": data["prompt"].strip(),
                "answer": "",
                "duration": 0,
            }

    elif data["type"] == "REQUEST_INSPECT":
        response = {
            "type": "SET_ANSWER",
            "key": data["key"],
            "command": data.get("command"),
            **serialize_inspect(data["id"], frame),
        }

    elif data["type"] == "REQUEST_SUGGESTION":
        response = {
            "type": "SET_SUGGESTION",
            **serialize_suggestion(
                data["prompt"],
                data["from"],
                data["to"],
                data["cursor"],
                get_frame(frame, data.get("frame"), tb),
            ),
        }

    elif data["type"] == "DO_COMMAND":
        command = data["command"]
        response = {"type": "ACK", "command": command}
        if command == "run":
            clear_step()
            stop_trace(frame)
        elif command == "stop":
            clear_step()
            stop_trace(frame)
            await adie()
        else:
            step_frame = get_frame(frame, data.get("frame"), tb)
            add_step(command, step_frame)
        response["stop"] = True

    else:
        raise ValueError(f"Unknown type {data['type']}")
    return response


async def communication_loop(frame_, event_, arg_, pending=None):
    frame = frame_
    event = event_
    arg = arg_

    ws, existing = await websocket_state()
    try:
        await ws.send_json({"type": "PAUSE"})
    except ConnectionResetError:
        log.info("Connection was reset")
        stop_trace(frame)
        return

    if existing:
        # If the socket is already opened we need to update client state
        await init(ws, frame, event, arg)
        if pending:
            # Start by sending pending message
            await ws.send_json(pending)
        # Otherwise if it's new, just wait for HELLO to answer current state

    stop = False
    try:
        async for msg in ws:
            if msg.type == WSMsgType.TEXT:
                data = json.loads(msg.data)
                try:
                    response = await handle_message(ws, data, frame, event, arg)
                except Exception as e:
                    log.error(f"Error handling message {data}", exc_info=e)
                    response = {
                        "type": "SET_ANSWER",
                        "prompt": data.get("prompt", "?").strip(),
                        "key": data.get("key"),
                        "command": data.get("command"),
                        "frame": data.get("frame"),
                        "answer": [serialize_exception(*sys.exc_info(), "internal")],
                    }
                log.debug(f"Got {data} answering with {response}")
                response["local"] = True

                if response.pop("recursive", False):
                    await ws.send_json({"type": "PAUSE", "recursive": True})
                    await init(ws, frame, event, arg)

                stop = response.pop("stop", False)

                try:
                    await ws.send_json(response)
                except ConnectionResetError:
                    break

                if stop:
                    break

            elif msg.type == WSMsgType.ERROR:
                log.error("WebSocket closed", exc_info=ws.exception())
                break
    except asyncio.CancelledError:
        log.error("WebSocket communication cancelled")

    # Browser exited, stopping debug if we are not stepping
    if not stop:
        stop_trace(frame)
        await adie()
