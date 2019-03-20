import os
import socket
import threading


def current_origin():
    return f'{socket.getfqdn()}__{os.getpid()}--{threading.get_ident()}'


def iter_frame(frame):
    while frame:
        yield frame
        frame = frame.f_back
