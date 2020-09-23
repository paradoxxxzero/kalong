import json
import linecache
import logging

from aiohttp import WSMsgType

from . import config
from .debugger import (
    serialize_answer,
    serialize_diff_eval,
    serialize_frames,
    serialize_inspect,
    serialize_inspect_eval,
    serialize_suggestion,
    get_frame,
)
from .loops import run
from .stepping import add_step, clear_step, stop_trace
from .utils import basicConfig
from .websockets import websocket, die

log = logging.getLogger(__name__)
basicConfig(level=config.log_level)


def communicate(frame, tb=None):
    run(communication_loop(frame, tb))


def initiate(event, frame, arg):
    if event == 'line':
        title = 'Tracing'
    elif event == 'call':
        title = f'Calling {frame.f_code.co_name}'
    elif event == 'return':
        title = f'Returning from {frame.f_code.co_name}'
    elif event == 'exception':
        title = f'{arg[0].__name__}: {arg[1]}'
    elif event == 'shell':
        title = 'Shell'
    run(
        send_once(
            {'type': 'PAUSE'},
            {'type': 'SET_THEME', 'theme': event},
            {'type': 'SET_TITLE', 'title': title},
            {
                'type': 'SET_FRAMES',
                'frames': list(
                    serialize_frames(
                        frame, arg[2] if event == "exception" else None
                    )
                )
                if event != 'shell'
                else [],
            },
        )
    )


async def send_once(*msgs):
    ws = await websocket()
    for msg in msgs:
        await ws.send_json(msg)


async def communication_loop(frame, tb=None):
    ws = await websocket()
    stop = False
    async for msg in ws:
        if msg.type == WSMsgType.TEXT:
            data = json.loads(msg.data)
            if data['type'] == 'GET_FRAMES':
                response = {
                    'type': 'SET_FRAMES',
                    'frames': list(serialize_frames(frame, tb)),
                }
            elif data['type'] == 'GET_FILE':
                filename = data['filename']
                file = ''.join(linecache.getlines(filename))

                response = {
                    'type': 'SET_FILE',
                    'filename': filename,
                    'source': file,
                }
            elif data['type'] == 'SET_PROMPT':
                response = {
                    'type': 'SET_ANSWER',
                    'key': data['key'],
                    'command': data.get('command'),
                    'frame': data.get('frame'),
                    **serialize_answer(
                        data['prompt'], get_frame(frame, data.get("frame"))
                    ),
                }
            elif data['type'] == 'REQUEST_INSPECT':
                response = {
                    'type': 'SET_ANSWER',
                    'key': data['key'],
                    'command': data.get('command'),
                    **serialize_inspect(data['id']),
                }
            elif data['type'] == 'REQUEST_INSPECT_EVAL':
                response = {
                    'type': 'SET_ANSWER',
                    'key': data['key'],
                    'command': data.get('command'),
                    **serialize_inspect_eval(
                        data['prompt'], get_frame(frame, data.get("frame"))
                    ),
                }
            elif data['type'] == 'REQUEST_DIFF_EVAL':
                response = {
                    'type': 'SET_ANSWER',
                    'key': data['key'],
                    'command': data.get('command'),
                    **serialize_diff_eval(
                        data['left'],
                        data['right'],
                        get_frame(frame, data.get("frame")),
                    ),
                }
            elif data['type'] == 'REQUEST_SUGGESTION':
                response = {
                    'type': 'SET_SUGGESTION',
                    **serialize_suggestion(
                        data['prompt'],
                        data['from'],
                        data['to'],
                        data['cursor'],
                        get_frame(frame, data.get("frame")),
                    ),
                }
            elif data['type'] == 'DO_COMMAND':
                command = data['command']
                response = {'type': 'ACK', 'command': command}
                if command == 'run':
                    clear_step()
                    stop_trace(frame)
                elif command == 'stop':
                    clear_step()
                    stop_trace(frame)
                    die()
                else:
                    add_step(command, frame)
                stop = True
            else:
                response = {
                    'type': 'error',
                    'message': f"Unknown type {data['type']}",
                }
            log.debug(f'Got {data} answering with {response}')
            response['local'] = True
            await ws.send_json(response)
            if stop:
                break
        elif msg.type == WSMsgType.ERROR:
            log.error(f'WebSocket closed', exc_info=ws.exception())
            stop_trace(frame)
