import json
import linecache
import logging

from aiohttp import WSMsgType

from .config import basicConfig, log_level
from .debugger import serialize_answer, serialize_frames
from .loops import get_loop
from .tracing import add_step, clear_step, stop_trace
from .websockets import close_websocket, websocket

log = logging.getLogger(__name__)
basicConfig(level=log_level)


def communicate(frame):
    loop = get_loop()
    loop.run_until_complete(communication_loop(frame))


async def communication_loop(frame):
    ws = await websocket()
    await ws.send_json(
        {'type': 'SET_FRAMES', 'frames': serialize_frames(frame)}
    )
    stop = False
    async for msg in ws:
        if msg.type == WSMsgType.TEXT:
            data = json.loads(msg.data)
            if data['type'] == 'GET_FRAMES':
                response = {
                    'type': 'SET_FRAMES',
                    'frames': serialize_frames(frame),
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
                    'type': 'SET_PROMPT_ANSWER',
                    'key': data['key'],
                    **serialize_answer(data['prompt'], frame),
                }
            elif data['type'] == 'DO_COMMAND':
                command = data['command']
                response = {'type': 'ACK', 'command': command}
                if command == 'continue':
                    clear_step()
                elif command == 'stop':
                    stop_trace(frame)
                    await close_websocket()
                    return
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
            stop_trace()
