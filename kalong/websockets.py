import asyncio
import logging
import os
import webbrowser
import socket
from threading import Lock

from aiohttp import ClientSession
from aiohttp.client_exceptions import ClientConnectorError

from .errors import NoServerFoundError
from .forking import forkserver
from .loops import get_loop
from .utils import current_origin, url

log = logging.getLogger(__name__)
fork_lock = Lock()

websockets = {}
sessions = {}

websocket_options = {"max_msg_size": 1024 * 1024 * 1024}


async def websocket():
    ws, _ = await websocket_state()
    return ws


async def websocket_state():
    # Here we get the magic cookie of our current thread in current pid
    origin = current_origin()
    if origin in websockets:
        log.debug(f"Found existing websocket {origin}")

        return websockets[origin], True

    sessions[origin] = sessions.get(origin, ClientSession())

    with fork_lock:
        try:
            ws = await sessions[origin].ws_connect(url("back"), **websocket_options)
            log.info("Found existing kalong server")
        except ClientConnectorError:
            # If there are no server available, fork one
            log.info("No kalong server, starting one")
            forkserver()
            for _ in range(500):
                await asyncio.sleep(0.05)
                try:
                    ws = await sessions[origin].ws_connect(
                        url("back"), **websocket_options
                    )
                    break
                except ClientConnectorError:
                    pass
            else:
                raise NoServerFoundError()

        if os.getenv("KALONG_URLSOCKET"):
            try:
                sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
                sock.connect(os.getenv("KALONG_URLSOCKET"))
                sock.send(url("front").encode("utf-8"))
                sock.shutdown(socket.SHUT_WR)
            finally:
                sock.close()
        # webbrowser.open should be in the mutex too, it's not thread safe
        elif os.getenv("KALONG_NO_BROWSER") or not webbrowser.open(url("front")):
            log.warning(
                f"Please open your browser to the following url: {url('front')}"
            )

    websockets[origin] = ws
    return ws, False


async def close_websocket():
    origin = current_origin()
    log.debug(f"Closing websocket {origin}")
    ws = websockets.pop(origin, None)
    session = sessions.pop(origin, None)

    if ws:
        await ws.close()
    if session:
        await session.close()


def die():
    log.info("Dying, closing socket.")
    loop = get_loop()
    loop.run_until_complete(close_websocket())


async def adie():
    log.info("Dying asynchronously, closing socket.")
    await close_websocket()


async def close_all(closeables):
    if not closeables:
        return
    await asyncio.gather(
        *[closeable.close() for closeable in closeables.values()],
        return_exceptions=True,
    )


def clean_websockets():
    log.info(f"Cleaning at exit {len(websockets)} ws and {len(sessions)} sessions")
    asyncio.run(close_all(websockets))
    asyncio.run(close_all(sessions))
