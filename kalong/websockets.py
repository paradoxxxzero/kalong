import asyncio
import logging
import os
import webbrowser
from itertools import chain
from threading import Lock

from aiohttp import ClientSession
from aiohttp.client_exceptions import ClientConnectorError

from .config import front_port, host, port, protocol
from .errors import NoServerFoundError
from .forking import forkserver
from .loops import get_loop
from .tools import current_origin

log = logging.getLogger(__name__)
fork_lock = Lock()

websockets = {}
sessions = {}


async def websocket():
    # Here we get the magic cookie of our current thread in current pid
    origin = current_origin()
    if origin in websockets:
        return websockets[origin]

    def url(side):
        overriden_port = front_port if side == 'front' else port
        return f'{protocol}://{host}:{overriden_port}/{side}/{origin}'

    sessions[origin] = sessions.get(origin, ClientSession())

    with fork_lock:
        try:
            ws = await sessions[origin].ws_connect(url('back'))
            log.info('Found existing kalong server')
        except ClientConnectorError:
            # If there are no server available, fork one
            log.info('No kalong server, starting one')
            forkserver()
            for delay in [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10]:
                await asyncio.sleep(delay, loop=get_loop())
                try:
                    ws = await sessions[origin].ws_connect(url('back'))
                    break
                except ClientConnectorError:
                    pass
            else:
                raise NoServerFoundError()

        # webbrowser.open should be in the mutex too, it's not thread safe
        if os.getenv('KALONG_NO_BROWSER') or not webbrowser.open(url('front')):
            log.warn(
                'Please open your browser to the following url: '
                f'{url("front")}'
            )

    websockets[origin] = ws
    return ws


async def close_websocket():
    origin = current_origin()
    try:
        await websockets[origin].close()
    finally:
        del websockets[origin]
        try:
            await sessions[origin].close()
        finally:
            del sessions[origin]


def die():
    log.info('Dying, closing socket.')
    loop = get_loop()
    loop.run_until_complete(close_websocket())


def clean_websockets():
    log.info(
        f'Cleaning at exit {len(websockets)} ws and {len(sessions)} sessions'
    )
    if not websockets:
        return
    loop = get_loop()
    loop.run_until_complete(
        asyncio.gather(
            *[
                ws.close()
                for ws in chain(websockets.values(), sessions.values())
            ],
            loop=loop,
            return_exceptions=True,
        )
    )
