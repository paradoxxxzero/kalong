import os
import socket
import threading

try:
    from log_colorizer import basicConfig
except ImportError:
    from logging import basicConfig  # noqa


def current_origin():
    return f'{socket.getfqdn()}__{os.getpid()}--{threading.get_ident()}'
