from . import config, run_file, shell

config.from_args()

if config.server:
    from .server import serve

    serve()
else:
    if config.command:
        run_file(*config.command)
    else:
        shell()
