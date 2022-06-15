import linecache
import os
import re
import signal
import socket
import sys
import threading
import traceback
from pathlib import Path

from .. import config
from .iterators import iter_frame

try:
    from log_colorizer import basicConfig
except ImportError:
    from logging import basicConfig  # noqa

try:
    import uncompyle6
except ImportError:
    uncompyle6 = None
except Exception:
    print("Uncompyle crashed at import:")
    traceback.print_exc()
    uncompyle6 = None

ORIGIN_RE = re.compile(r"(.+)__(.+)--(.+)")


def current_origin():
    return f"{socket.getfqdn()}__{os.getpid()}--{threading.get_ident()}"


def parse_origin(origin):
    match = ORIGIN_RE.search(origin)
    if not match:
        raise ValueError(
            f"Invalid origin format {origin} must match {ORIGIN_RE}"
        )
    fqdn, pid, ident = match.groups()

    return fqdn, int(pid), int(ident)


class fake_argv:
    def __init__(self, *args):
        self.args = args

    def __enter__(self):
        self._old_args = sys.argv
        sys.argv = self.args

    def __exit__(self, *err):
        sys.argv = self._old_args


USER_SIGNAL = signal.SIGILL if sys.platform == "win32" else signal.SIGUSR1


def url(side):
    origin = current_origin()
    overriden_port = config.front_port if side == "front" else config.port
    protocol = config.protocol
    host = config.host
    return f"{protocol}://{host}:{overriden_port}/{side}/{origin}"


def human_readable_side(side):
    return "browser" if side == "front" else "program"


def discompile(code):
    if not uncompyle6:
        return ""
    try:
        return uncompyle6.deparse_code2str(code)
    except Exception:
        return ""


def get_file_from_code(frame, filename):
    for frame in iter_frame(frame):
        co_filename = frame.f_code.co_filename or "<unspecified>"
        if co_filename == "<frozen importlib._bootstrap>":
            co_filename = os.path.join(
                os.path.dirname(linecache.__file__),
                "importlib",
                "_bootstrap.py",
            )
        fn = Path(co_filename)
        if not co_filename.startswith("<"):
            fn = fn.resolve()

        if filename == str(fn):
            return discompile(frame.f_code)
