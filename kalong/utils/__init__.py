import os
import re
import signal
import socket
import sys
import threading

from .. import config

try:
    from log_colorizer import basicConfig
except ImportError:
    from logging import basicConfig  # noqa

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
