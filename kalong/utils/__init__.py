import os
import socket
import sys
import threading

try:
    from log_colorizer import basicConfig
except ImportError:
    from logging import basicConfig  # noqa


def current_origin():
    return f'{socket.getfqdn()}__{os.getpid()}--{threading.get_ident()}'


class fake_argv:
    def __init__(self, *args):
        self.args = args

    def __enter__(self):
        self._old_args = sys.argv
        sys.argv = self.args

    def __exit__(self, *err):
        sys.argv = self._old_args
