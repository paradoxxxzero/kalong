import sys


def breakpoint():
    from .tracing import add_step, start_trace, stop_trace

    frame = sys._getframe().f_back
    stop_trace(frame)
    add_step('step', frame)
    start_trace(frame)
