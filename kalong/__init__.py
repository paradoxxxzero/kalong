"""A new take on debugging"""

__version__ = "0.7.0"
import os
import sys
from pathlib import Path
from subprocess import run

from .config import Config

config = Config()
config.from_env()


def breakpoint():
    from .stepping import add_step, start_trace, stop_trace

    frame = sys._getframe().f_back
    stop_trace(frame)
    add_step("step", frame)
    start_trace(frame)


def break_above(level):
    from .stepping import add_step, start_trace, stop_trace

    frame = sys._getframe()
    while level > 0 and frame.f_back:
        level += 1
        frame = frame.f_back

    stop_trace(frame)
    add_step("step", frame)
    start_trace(frame)


def start_trace(break_=False, full=False, skip_frames=None):
    from .stepping import add_step, start_trace

    frame = sys._getframe().f_back
    add_step(
        "stepInto" if break_ else ("trace" if full else "continue"),
        frame,
        skip_frames,
    )
    start_trace(frame)


def stop_trace():
    from .stepping import stop_trace

    frame = sys._getframe().f_back
    stop_trace(frame)


class trace:
    def __init__(self, **kwargs):
        self.kwargs = kwargs

    def __enter__(self):
        stop_trace()
        start_trace(**self.kwargs)

    def __exit__(self, *args):
        stop_trace()


def run_file(filename, *args, break_=True):
    # Cleaning __main__ namespace
    import __main__

    from .utils import fake_argv

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
            fp.read(), os.path.abspath(os.path.normcase(filename)), "exec"
        )

    globals = __main__.__dict__
    locals = globals
    with fake_argv(filename, *args):
        with trace(break_=break_):
            exec(statement, globals, locals)


def shell():
    # Launch a shell
    from .communication import communicate

    frame = sys._getframe()
    # Enter the websocket communication loop that pauses the execution
    communicate(frame, "shell", [])


def main():
    os.environ["PYTHONBREAKPOINT"] = "kalong.breakpoint"
    config.from_args()

    if config.server:
        from .server import serve

        serve()

    elif config.inject:
        kalong_dir = Path(__file__).resolve().parent.parent
        gdb_command = ["gdb", "-p", str(config.inject), "-batch"] + [
            "-eval-command=call %s" % hook
            for hook in [
                "(int) PyGILState_Ensure()",  # Getting the GIL
                '(int) PyRun_SimpleString("'
                f"print('* Kalong injection from {os.getpid()} *');"
                "import sys;"  # Putting kalong project directory in sys path:
                f"sys.path.insert(0, '{kalong_dir}');"
                "import kalong;"  # Setting breakpoint:
                "kalong.break_above(2);"
                '")',
                # Releasing the GIL with the PyGILState_Ensure handle:
                "(void) PyGILState_Release($1)",
            ]
        ]
        print(f"Running: {' '.join(gdb_command)}")
        run(gdb_command)

    else:
        if config.command:
            run_file(*config.command, break_=config.break_at_start)
        else:
            shell()


if __name__ == "__main__":
    main()
