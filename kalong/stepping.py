import atexit
import linecache
import logging
import sys
from functools import partial
from pathlib import Path

from .loops import clean_loops
from .tools import current_origin, iter_frame
from .websockets import clean_websockets

log = logging.getLogger(__name__)

steppings = {}
kalong_dir = str(Path(__file__).resolve().parent)


def add_step(type, frame):
    origin = current_origin()
    steppings[origin] = {'type': type, 'frame': frame}


def clear_step():
    origin = current_origin()
    del steppings[origin]


def start_trace(frame):
    from .tracing import trace

    origin = current_origin()
    log.debug(f'Starting trace for {origin}')

    linecache.checkcache()
    current_trace = partial(trace, origin)
    sys.settrace(current_trace)
    for f in iter_frame(frame):
        f.f_trace = current_trace


def stop_trace(frame):
    sys.settrace(None)
    for f in iter_frame(frame):
        f.f_trace = None


@atexit.register
def cleanup():
    clean_websockets()
    clean_loops()