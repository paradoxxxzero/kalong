import logging
import sys
import threading
from multiprocessing import process
from pathlib import Path

from .communication import communicate
from .stepping import steppings, stop_trace
from .websockets import die

log = logging.getLogger(__name__)

kalong_dir = str(Path(__file__).resolve().parent)


def trace(origin, frame, event, arg):
    stepping = steppings.get(origin)
    if not stepping:
        return

    type = stepping.get("type")
    originalFrame = stepping.get("frame")
    lno = stepping.get("lno")
    filename = frame.f_code.co_filename

    # When we are in _shutdown of thread, program is finished
    if (
        filename == threading.__file__
        and frame.f_code.co_name in ["_shutdown", "_bootstrap_inner"]
        or filename == process.__file__
        and frame.f_code.co_name == "_bootstrap"
    ):
        stop_trace(frame)
        die()
        return

    # If we are tracing, we continue tracing if this is not an exception
    if type == "trace" and event != "exception":
        return sys.gettrace()

    # If we are continuing, don't trace anything but current frame
    if type == "continue":
        if frame == originalFrame:
            # Continue tracing current frame
            if event != "exception":
                return sys.gettrace()
        else:
            # Stop tracing if below
            return

    # Don't trace importlib bootstrapping
    if filename == "<frozen importlib._bootstrap>":
        return

    # Don't trace self
    if filename.startswith(kalong_dir):
        return

    # Don't trace under frames if we are not stepping 'into'
    if event == "call" and type != "stepInto":
        return

    if (
        # Trace: This is an exception: stop
        type == "trace"
        # Continue: This is an exception at current frame: stop
        or type == "continue"
        # Step: Normal stepping
        or type == "step"
        # StepInto: Stepping normally in new frame as well
        or type == "stepInto"
        # StepUntil: Stepping only if line number is greater than previously
        or (
            type == "stepUntil"
            and (frame != originalFrame or frame.f_lineno > lno)
        )
        # StepOut: Stepping only if we are returning or in the parent frame
        or (
            type == "stepOut"
            and (
                (event == "return" and frame == originalFrame)
                or event == "line"
                and frame == originalFrame.f_back
            )
        )
    ):
        # Enter the websocket communication loop that pauses the execution
        communicate(frame, event, arg)

    return sys.gettrace()
