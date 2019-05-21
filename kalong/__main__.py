import sys

from . import config

config.from_args()

if config.server:
    from .server import serve

    serve()
    sys.exit(0)
else:
    from . import breakpoint

    breakpoint()
