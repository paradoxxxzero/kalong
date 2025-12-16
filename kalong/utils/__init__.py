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
        raise ValueError(f"Invalid origin format {origin} must match {ORIGIN_RE}")
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
    host = config.front_host if side == "front" else config.host
    port = config.front_port if side == "front" else config.port
    protocol = config.protocol
    return f"{protocol}://{host}:{port}/{side}/{origin}"


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


def cutter_mock(text, cursor):
    ch = cursor["ch"]
    new_text = []
    for lno, line in enumerate(text.split("\n")):
        new_line = []
        for c, char in enumerate(line):
            if char == "!":
                new_line.append("[0].")
                if lno == cursor["line"] and c <= ch:
                    cursor["ch"] += 3

            else:
                new_line.append(char)
        new_text.append("".join(new_line))

    return "\n".join(new_text), cursor


def universal_get(item, key):
    if isinstance(item, dict):
        return item.get(key, "___void___")

    if hasattr(item, "__getitem__") and key.isdigit():
        try:
            return item.__class__.__getitem__(item, int(key))
        except IndexError:
            return "___void___"
    try:
        return getattr(item, str(key), "___void___")
    except Exception as e:
        return e


def universal_travel(item, path):
    for key in path.split("."):
        item = universal_get(item, key)
        if item == "___void___":
            return "___void___"

    return item


def dedent(code):
    lines = code.split("\n")
    if not lines:
        return code
    indent = min(
        [len(line) - len(line.lstrip()) for line in lines if line.strip()],
        default=0,
    )
    return "\n".join(line[indent:] for line in lines)
