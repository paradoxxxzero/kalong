import asyncio
import logging
import signal
import sys
import threading

from .utils import current_origin

log = logging.getLogger(__name__)


loops = {}


def get_loop():
    # Here we get the magic cookie of our current thread in current pid
    origin = current_origin()
    if origin not in loops:
        loops[origin] = asyncio.new_event_loop()
        if (
            sys.platform != "win32"
            and threading.current_thread() is threading.main_thread()
        ):
            loops[origin].add_signal_handler(signal.SIGTERM, stop)
    return loops[origin]


def close_loop():
    origin = current_origin()
    try:
        loops[origin].close()
    finally:
        del loops[origin]


def clean_loops():
    log.info(f"Cleaning at exit {len(loops)} event loops")
    if not loops:
        return
    for loop in loops.values():
        loop.close()


def stop():
    for task in asyncio.all_tasks():
        task.cancel()
