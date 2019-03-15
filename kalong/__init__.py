import asyncio
import dis
import json
import linecache
import logging
import os
import subprocess
import sys
import webbrowser
from contextlib import asynccontextmanager
from pathlib import Path

import log_colorizer
from aiohttp import ClientSession, WSMsgType
from aiohttp.client_exceptions import ClientConnectorError

from .errors import NoServerFoundError
from .tools import current_origin

protocol = 'http'
host = 'localhost'
port = 59999

log = logging.getLogger(__name__)


def forkserver():
    """
    Fork a detached server.py server that will continue to run as long
    as it has clients.
    """
    popen_args = (
        {
            'creationflags': subprocess.DETACHED_PROCESS
            | subprocess.CREATE_NEW_PROCESS_GROUP
        }  # Test this
        if sys.platform[:3] == 'win'
        else {'start_new_session': True}
    )
    log.warn(os.environ)
    server = subprocess.Popen(
        [sys.executable, '-m', 'kalong'],
        close_fds=True,
        env=os.environ,
        **popen_args,
    )
    # Raise error here?
    return server.poll()


@asynccontextmanager
async def websocket():
    # Here we get the magic cookie of our current thread in current pid
    origin = current_origin()

    def url(side):
        return f'{protocol}://{host}:{port}/{side}/{origin}'

    async with ClientSession() as session:
        try:
            ws = await session.ws_connect(url('back'))
        except ClientConnectorError:
            # If there are no server available, fork one
            log.info('No kalong server, starting one')
            forkserver()
            for delay in [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10]:
                await asyncio.sleep(delay)
                try:
                    ws = await session.ws_connect(url('back'))
                    break
                except ClientConnectorError:
                    pass
            else:
                raise NoServerFoundError()
        if os.getenv('KALONG_NO_BROWSER') or not webbrowser.open(url('front')):
            log.warn(
                'Please open your browser to the following url: '
                f'{url("front")}'
            )
        try:
            yield ws
        finally:
            await ws.close()


def get_frame(current_frame):
    frame = current_frame
    frames = []
    while frame:
        code = frame.f_code
        filename = code.co_filename or '<unspecified>'
        lno = frame.f_lineno
        line = None
        linecache.checkcache(filename)
        line = linecache.getline(filename, lno, frame.f_globals)
        line = line and line.strip()
        startlnos = dis.findlinestarts(code)
        lastlineno = list(startlnos)[-1][1]
        frames.append(
            {
                'key': id(code),
                'filename': str(Path(filename).resolve()),
                'function': code.co_name,
                'firstFunctionLineNumber': code.co_firstlineno,
                'lastFunctionLineNumber': lastlineno,
                'lineNumber': lno,
                'lineSource': line,
                'active': frame == current_frame,
            }
        )
        frame = frame.f_back
    return frames


async def communicate(frame):
    async with websocket() as ws:
        async for msg in ws:
            if msg.type == WSMsgType.TEXT:
                data = json.loads(msg.data)
                if data['type'] == 'GET_FRAMES':
                    response = {
                        'type': 'SET_FRAMES',
                        'frames': get_frame(frame),
                    }
                elif data['type'] == 'GET_FILE':
                    response = {
                        'type': 'SET_FILE',
                        'filename': data['filename'],
                        'source': ''.join(
                            linecache.getlines(data['filename'])
                        ),
                    }
                else:
                    response = {
                        'type': 'error',
                        'message': f"Unknown type {data['type']}",
                    }
                log.info(f'Got {data} answering with {response}')
                await ws.send_json(response)
            elif msg.type == WSMsgType.ERROR:
                log.error(f'WebSocket closed', exc_info=ws.exception())


def breakpoint(frame=None):
    frame = frame or sys._getframe().f_back
    log_colorizer.basicConfig(level=logging.DEBUG)
    linecache.checkcache()
    asyncio.run(communicate(frame))
