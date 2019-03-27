import os
import socket
import threading


def current_origin():
    return f'{socket.getfqdn()}__{os.getpid()}--{threading.get_ident()}'


def iter_frame(frame):
    while frame:
        yield frame
        frame = frame.f_back


def iter_traceback(tb):
    while tb:
        yield tb
        tb = tb.tb_next


def iter_stack(frame, tb):
    for t in reversed(list(iter_traceback(tb))):
        if t.tb_frame == frame:
            break
        yield t.tb_frame, t.tb_lineno

    for f in iter_frame(frame):
        yield f, f.f_lineno
