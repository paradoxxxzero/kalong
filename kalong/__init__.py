import asyncio
import dis
import json
import linecache
import logging
import os
import subprocess
import sys
import threading
import webbrowser
from contextlib import asynccontextmanager
from pathlib import Path

import log_colorizer
from aiohttp import ClientSession, WSMsgType
from aiohttp.client_exceptions import ClientConnectorError

protocol = 'http'
host = 'localhost'
port = 59999

log = logging.getLogger(__name__)


class NoServerFoundError(Exception):
    pass


class CantStartServerError(Exception):
    pass


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
    server = subprocess.Popen(
        [sys.executable, Path(__file__).parent.resolve() / 'server.py'],
        close_fds=True,
        **popen_args,
    )
    # Raise error here?
    return server.poll()


@asynccontextmanager
async def websocket():
    # Here we get the magic cookie of our current thread in current pid
    origin = f'{os.getpid()}_{threading.get_ident()}'
    url = lambda side: f'{protocol}://{host}:{port}/{side}/{origin}'

    async with ClientSession() as session:
        try:
            ws = await session.ws_connect(url('back'))
        except ClientConnectorError:
            # If there are no server available, fork one
            forkserver()
            for delay in [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1]:
                await asyncio.sleep(delay)
                try:
                    ws = await session.ws_connect(url('back'))
                    break
                except ClientConnectorError:
                    pass
            else:
                raise NoServerFoundError()
        if not webbrowser.open(url('front')):
            log.warn(
                f'Please open your browser to the following url {url("front")}'
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
                'file': str(Path(filename).resolve()),
                'function': code.co_name,
                'flno': code.co_firstlineno,
                'llno': lastlineno,
                'lno': lno,
                'code': line,
                'current': frame == current_frame,
            }
        )
        frame = frame.f_back
    return frames


async def communicate(frame):
    async with websocket() as ws:
        log.info(f'Back connected')
        log.info(f'Sending frame')
        await ws.send_json(get_frame(frame))
        async for msg in ws:
            if msg.type == WSMsgType.TEXT:
                data = json.loads(msg.data)
                log.info(f'Got {msg.data}')
                await ws.send_json(data)
            elif msg.type == WSMsgType.ERROR:
                log.error(f'WebSocket closed', exc_info=ws.exception())


def breakpoint(frame=None):
    frame = frame or sys._getframe().f_back
    log_colorizer.basicConfig(level=logging.DEBUG)
    linecache.checkcache()
    asyncio.run(communicate(frame))
