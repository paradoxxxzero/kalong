import atexit
import linecache
import logging
import signal
import sys
import threading
from functools import partial
from pathlib import Path

from .loops import clean_loops
from .utils import current_origin, USER_SIGNAL
from .utils.iterators import iter_frame
from .websockets import clean_websockets

log = logging.getLogger(__name__)

steppings = {}
kalong_dir = str(Path(__file__).resolve().parent)


def add_step(type, frame):
    origin = current_origin()
    steppings[origin] = {"type": type, "frame": frame, "lno": frame.f_lineno}


def clear_step():
    origin = current_origin()
    if origin in steppings:
        del steppings[origin]


def start_trace(frame):
    from .tracing import trace

    origin = current_origin()
    log.debug(f"Starting trace for {origin}")

    linecache.checkcache()
    current_trace = partial(trace, origin)
    sys.settrace(current_trace)
    for f in iter_frame(frame):
        f.f_trace = current_trace


def stop_trace(frame):
    log.debug("Stopping trace")
    sys.settrace(None)
    for f in iter_frame(frame):
        f.f_trace = None


@atexit.register
def cleanup():
    log.debug("Cleaning up at exit")
    stop_trace(sys._getframe())
    clean_websockets()
    clean_loops()


if threading.current_thread() is threading.main_thread():
    user_signal_handler = None

    def handle_user_signal(*args, **kwargs):
        log.info("Handling breakpoint on user signal")
        frame = sys._getframe().f_back
        add_step("step", frame)
        start_trace(frame)

        if user_signal_handler not in (signal.SIG_IGN, signal.SIG_DFL):
            user_signal_handler(*args, **kwargs)

    user_signal_handler = signal.signal(USER_SIGNAL, handle_user_signal)
