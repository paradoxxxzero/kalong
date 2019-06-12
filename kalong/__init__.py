"""A new take on debugging"""
__version__ = "0.0.0"
import os
import sys

from .config import Config

config = Config()
config.from_env()


def breakpoint():
    from .stepping import add_step, start_trace, stop_trace

    frame = sys._getframe().f_back
    stop_trace(frame)
    add_step('step', frame)
    start_trace(frame)


def break_above(level):
    from .stepping import add_step, start_trace, stop_trace

    frame = sys._getframe()
    while level > 0 and frame.f_back:
        level += 1
        frame = frame.f_back

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


class trace:
    def __enter__(self):
        start_trace()

    def __exit__(self, *args):
        stop_trace()


def run_file(filename, *args):
    # Cleaning __main__ namespace
    from .stepping import add_step
    from .utils import fake_argv
    import __main__

    __main__.__dict__.clear()
    __main__.__dict__.update(
        {
            "__name__": "__main__",
            "__file__": filename,
            "__builtins__": __builtins__,
        }
    )
    with open(filename, "rb") as fp:
        statement = compile(
            fp.read(), os.path.abspath(os.path.normcase(filename)), 'exec'
        )

    globals = __main__.__dict__
    locals = globals
    with fake_argv(filename, *args):
        add_step('stepInto')
        with trace():
            exec(statement, globals, locals)


def shell():
    # Launch a shell
    from .communication import initiate, communicate

    frame = sys._getframe()
    # Inform clients
    initiate('shell', frame, None)
    # Enter the websocket communication loop that pauses the execution
    communicate(frame)
