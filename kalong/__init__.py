"""A new take on debugging"""
__version__ = "0.0.0"


import sys


def breakpoint():
    from .stepping import add_step, start_trace, stop_trace

    frame = sys._getframe().f_back
    stop_trace(frame)
    add_step('step', frame)
    start_trace(frame)


def start_trace():
    from .stepping import start_trace

    frame = sys._getframe().f_back
    start_trace(frame)


def stop_trace():
    from .stepping import stop_trace

    frame = sys._getframe().f_back
    stop_trace(frame)
