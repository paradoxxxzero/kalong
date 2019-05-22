from . import config

config.from_args()

if config.server:
    from .server import serve

    serve()
else:
    from . import breakpoint

    breakpoint()
