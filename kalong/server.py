import asyncio
import json
import logging
import os
import signal
from itertools import chain
from pathlib import Path

from aiohttp import WSMsgType, web
from aiohttp.web_runner import GracefulExit

from . import config
from .errors import NoClientFoundError
from .utils import USER_SIGNAL, basicConfig, human_readable_side, parse_origin
from .websockets import websocket_options

log = logging.getLogger(__name__)
basicConfig(level=config.log_level)


def maybe_bail(app):
    if not app["front"] and not app["back"]:
        log.info("No remaining clients, gracefully bailing.")
        raise GracefulExit()
    else:
        log.info(
            f"Not closing since {len(app['front'])} front and "
            + f"{len(app['back'])} back connections remains."
        )


def index():
    index.__content__ = getattr(index, "__content__", None)
    if not index.__content__:
        with open(Path(__file__).parent / "static" / "index.html", "rb") as f:
            index.__content__ = f.read()
        if config.ws_port != config.port or config.ws_host != config.host:
            index.__content__ = index.__content__.replace(
                b"</body>",
                f"""
            <script>
                window.KALONG_WS_HOST = "{config.ws_host}";
                window.KALONG_WS_PORT = {config.ws_port};
            </script>
        </body>
        """.encode(),
            )
    return web.Response(body=index.__content__, content_type="text/html")


async def shutdown(app):
    log.info("App shutdown, closing remaining websockets.")
    await asyncio.gather(
        *[ws.close() for ws in chain(app["front"].values(), app["back"].values())]
    )
    app["front"].clear()
    app["back"].clear()


async def peer(app, side, origin):
    if origin in app[side]:
        return app[side][origin]
    else:
        for _ in range(500):
            await asyncio.sleep(0.05)
            if origin in app[side]:
                return app[side][origin]
        raise NoClientFoundError(
            f"No {human_readable_side(side)} was open to connect to debugger"
        )


async def websocket(request):
    side = request.match_info["side"]
    other_side = "back" if side == "front" else "front"
    origin = request.match_info["origin"]
    ws = web.WebSocketResponse(**websocket_options)

    state = ws.can_prepare(request)
    if not state.ok:
        log.debug(f"Sending {side} app for {origin}")
        return index()

    await ws.prepare(request)

    log.debug(f"{side.title()} app connected for {origin}")
    request.app[side][origin] = ws

    try:
        async for msg in ws:
            if msg.type == WSMsgType.TEXT:
                data = json.loads(msg.data)
                log.debug(f"{side} -> {other_side}: {data}")
                try:
                    pair = await peer(request.app, other_side, origin)
                except NoClientFoundError:
                    log.error(
                        f"No {human_readable_side(other_side)} connection was found, aborting debugger"
                    )
                    break
                if data["type"] == "DO_COMMAND":
                    if data["command"] in ["pause", "kill"]:
                        _, pid, _ = parse_origin(origin)
                        sign = (
                            signal.SIGKILL if data["command"] == "kill" else USER_SIGNAL
                        )
                        log.info(f"Sending signal {sign} to {pid}")
                        os.kill(pid, sign)
                        continue

                await pair.send_json(data)
            elif msg.type == WSMsgType.ERROR:
                log.error(f"{side.title()} closed", exc_info=ws.exception())
    except asyncio.CancelledError:
        log.error(f"{side.title()} WebSocket communication cancelled")

    log.debug(f"Closing {side}")

    if side in request.app and origin in request.app[side]:
        request.app[side].pop(origin)

    if not config.detached:
        if origin in request.app[other_side]:
            log.debug(f"Closing {other_side} due to {side} closing.")
            s = request.app[other_side].pop(origin)
            await s.close()

    await ws.close()
    maybe_bail(request.app)
    return ws


def exception_handler(loop, context):
    logging.error(f"Loop exit: {context}")


def serve():
    app = web.Application()
    app["front"] = {}
    app["back"] = {}
    app.on_shutdown.append(shutdown)
    app.router.add_get(r"/{side:(front|back)}/{origin}", websocket)
    app.router.add_static("/assets/", Path(__file__).parent / "static" / "assets")
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
    loop.set_exception_handler(exception_handler)
    web.run_app(app, host=config.host, port=config.port, print=False, loop=loop)
