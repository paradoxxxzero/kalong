import asyncio
import json
import logging
from itertools import chain
from pathlib import Path

from aiohttp import WSMsgType, web
from aiohttp.web_runner import GracefulExit

from .config import basicConfig, detached, host, log_level, port
from .errors import NoClientFoundError

log = logging.getLogger(__name__)
basicConfig(level=log_level)


def maybe_bail(app):
    if not app['front'] and not app['back']:
        log.info('No remaining clients, gracefully bailing.')
        raise GracefulExit()
    else:
        log.info(
            f"Not closing since {len(app['front'])} front and "
            + f"{len(app['back'])} back connections remains."
        )


async def shutdown(app):
    log.info('App shutdown, closing remaining websockets.')
    await asyncio.gather(
        *[
            ws.close()
            for ws in chain(app['front'].values(), app['back'].values())
        ]
    )
    app['front'].clear()
    app['back'].clear()


async def peer(app, side, origin):
    if origin in app[side]:
        return app[side][origin]
    else:
        for delay in [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]:
            await asyncio.sleep(delay)
            if origin in app[side]:
                return app[side][origin]
        raise NoClientFoundError()


async def websocket(request):
    side = request.match_info['side']
    other_side = 'back' if side == 'front' else 'front'
    origin = request.match_info['origin']
    ws = web.WebSocketResponse()

    state = ws.can_prepare(request)
    if not state.ok:
        log.debug(f'Sending {side} app for {origin}')
        return web.FileResponse(
            Path(__file__).parent / 'assets' / 'index.html'
        )

    await ws.prepare(request)

    log.debug(f'{side.title()} app connected for {origin}')
    request.app[side][origin] = ws

    async for msg in ws:
        if msg.type == WSMsgType.TEXT:
            data = json.loads(msg.data)
            log.debug(f'{side} -> {other_side}: {data}')
            pair = await peer(request.app, other_side, origin)
            await pair.send_json(data)
        elif msg.type == WSMsgType.ERROR:
            log.error(f'{side.title()} closed', exc_info=ws.exception())

    log.debug(f'Closing {side}')
    await ws.close()
    del request.app[side][origin]

    if not detached and origin in request.app[other_side]:
        log.debug(f'Closing {other_side} due to {side} closing.')
        await request.app[other_side][origin].close()

    maybe_bail(request.app)
    return ws


def main():
    app = web.Application()
    app['front'] = {}
    app['back'] = {}
    app.on_shutdown.append(shutdown)
    app.router.add_get(r'/{side:(front|back)}/{origin}', websocket)
    app.router.add_static('/assets/', Path(__file__).parent / 'assets')
    web.run_app(app, host=host, port=port)
