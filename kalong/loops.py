import asyncio
import logging
import signal
import sys

from .utils import current_origin

log = logging.getLogger(__name__)


loops = {}


def get_loop():
    # Here we get the magic cookie of our current thread in current pid
    origin = current_origin()
    if origin not in loops:
        loops[origin] = asyncio.new_event_loop()
        # asyncio.set_event_loop(loops[origin])
    return loops[origin]


def close_loop():
    origin = current_origin()
    try:
        loops[origin].close()
    finally:
        del loops[origin]


def clean_loops():
    log.info(f'Cleaning at exit {len(loops)} event loops')
    if not loops:
        return
    for loop in loops.values():
        loop.close()


def stop():
    for task in asyncio.Task.all_tasks():
        task.cancel()


def run(coro):
    loop = get_loop()
    try:
        loop.run_until_complete(coro)
    except asyncio.exceptions.CancelledError:
        from .websockets import die

        log.info("Loop got cancelled")
        die()
        sys.exit(0)

    loop.add_signal_handler(signal.SIGTERM, stop)
