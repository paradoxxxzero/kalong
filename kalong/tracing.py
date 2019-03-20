import linecache
import sys
import threading
from functools import partial
from pathlib import Path

from .tools import current_origin, iter_frame

steppings = {}
kalong_dir = str(Path(__file__).resolve().parent)


def add_step(type, frame):
    origin = current_origin()
    steppings[origin] = {'type': type, 'frame': frame}


def clear_step():
    origin = current_origin()
    del steppings[origin]


def start_trace(frame):
    from .communication import communicate

    linecache.checkcache()
    current_trace = partial(trace, current_origin(), communicate)
    sys.settrace(current_trace)
    for f in iter_frame(frame):
        f.f_trace = current_trace


def stop_trace(frame):
    sys.settrace(None)
    for f in iter_frame(frame):
        f.f_trace = None


def trace(origin, communicate, frame, event, arg):
    stepping = steppings.get(origin)
    if not stepping:
        # Continue tracing in case of exception
        return sys.gettrace()
    type = stepping.get('type')
    originalFrame = stepping.get('frame')
    filename = frame.f_code.co_filename

    # When we are in _shutdown of thread, program is finished
    if filename == threading.__file__ and frame.f_code.co_name == '_shutdown':
        stop_trace(frame)
        return

    # Don't trace importlib bootstrapping
    if filename == '<frozen importlib._bootstrap>':
        return

    # Don't trace self
    if filename.startswith(kalong_dir):
        return

    # Don't trace under frames if we are not stepping 'into'
    if event == 'call' and type != 'stepInto':
        return

    if (
        type == 'step'  # Step: Normal stepping
        or type
        == 'stepInto'  # StepInto: Stepping normally in new frame as well
        # StepUntil: Stepping only if line number is greater than previously
        or (
            type == 'stepUntil'
            and (
                frame != originalFrame
                or frame.f_lineno > originalFrame.f_lineno
            )
        )
        # StepOut: Stepping only if we are returning or in the parent frame
        or (
            type == 'stepOut'
            and (
                (event == 'return' and frame == originalFrame)
                or event == 'line'
                and frame == originalFrame.f_back
            )
        )
    ):
        # Enter the websocket communication loop that pauses the execution
        communicate(frame)
    return sys.gettrace()
