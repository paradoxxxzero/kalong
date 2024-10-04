import logging
import sys
import threading
from multiprocessing import process
from pathlib import Path

from .communication import communicate
from .stepping import steppings, stop_trace
from .utils.iterators import iter_frame
from .websockets import die

log = logging.getLogger(__name__)

kalong_dir = str(Path(__file__).resolve().parent)


def trace(origin, frame, event, arg):
    stepping = steppings.get(origin)
    if not stepping:
        return

    type = stepping.get("type")
    originalFrame = stepping.get("frame")
    baseFrame = stepping.get("base_frame", originalFrame)
    lno = stepping.get("lno")
    skip_frames = stepping.get("skip_frames")
    filename = frame.f_code.co_filename
    into_type = None
    pending = None

    if type.startswith("stepInto"):
        into_type = type.split("stepInto")[1].lower() or "skipcore"
        type = "stepInto"

    parent_frames = list(iter_frame(frame))
    below = parent_frames.index(baseFrame) if baseFrame in parent_frames else -1

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
            if stepping.get("condition"):
                # Check the condition
                response = stepping["condition"]()
                answers = response["answer"]
                # Break if answer is truthy
                break_ = len(answers) > 0 and (
                    any(answer.get("truthiness", True) for answer in answers)
                )
                if not break_:
                    # Continue tracing current frame
                    return sys.gettrace()
                pending = response

            # Continue tracing current frame
            elif event != "exception":
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
    if event == "call":
        if type != "stepInto":
            return
        # or if we are stepping into public methods only
        if into_type == "public" and frame.f_code.co_name.startswith("_"):
            return
        # or if we are not all and stepping into core methods
        if into_type == "skipcore" and frame.f_code.co_name.startswith("__"):
            return

    if skip_frames and (
        (event in ["call", "line"] and below - 1 < skip_frames)
        or (event == "return" and below - 1 < skip_frames)
    ):
        return sys.gettrace()

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
        or (type == "stepUntil" and (frame != originalFrame or frame.f_lineno > lno))
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
        if event == "return":
            frame.f_locals["__kalong_return_value__"] = arg
        elif event == "exception":
            frame.f_locals["__kalong_exception__"] = arg
        # Enter the websocket communication loop that pauses the execution
        communicate(frame, event, arg, pending)

    return sys.gettrace()
