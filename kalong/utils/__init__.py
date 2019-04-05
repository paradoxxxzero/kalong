import os
import socket
import threading


def current_origin():
    return f'{socket.getfqdn()}__{os.getpid()}--{threading.get_ident()}'
