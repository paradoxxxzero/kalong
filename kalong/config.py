import logging
import os
from argparse import REMAINDER, ArgumentParser

defaults = {
    "server": False,
    "protocol": "http",
    "host": "localhost",
    "port": 59999,
    "front_host": "localhost",
    "front_port": 59999,
    "ws_host": "localhost",
    "ws_port": 59999,
    "log": "warn",
    "detached": False,
    "command": [],
    "inject": None,
    "urlsocket": False,
}


class Config:
    def __init__(self):
        self.__dict__.update(defaults)

    def get_parser(self):
        parser = ArgumentParser(description="Kalong cli")
        parser.add_argument(
            "--server",
            action="store_true",
            help="Launch the kalong server. This option is used by kalong itself",
        )
        parser.add_argument(
            "--protocol",
            default=self.protocol,
            help="Protocol for contacting kalong server",
        )
        parser.add_argument(
            "--host",
            default=self.host,
            help="Host of kalong server",
        )
        parser.add_argument(
            "--port",
            type=int,
            default=self.port,
            help="Port of kalong server",
        )
        parser.add_argument(
            "--front-host",
            default=self.front_host,
            help="Host of kalong frontend, defaults to host option",
        )
        parser.add_argument(
            "--front-port",
            type=int,
            default=self.front_port,
            help="Port of kalong frontend, defaults to port option",
        )
        parser.add_argument(
            "--ws-host",
            default=self.ws_host,
            help="Host of kalong websocket server, defaults to host option",
        )
        parser.add_argument(
            "--ws-port",
            type=int,
            default=self.ws_port,
            help="Port of kalong websocket server, defaults to port option",
        )
        parser.add_argument(
            "--log",
            choices=["critical", "error", "warning", "info", "debug"],
            default=self.log,
            help="Kalong verbosity",
        )
        parser.add_argument(
            "--detached",
            action="store_true",
            help="Server won't exit in this mode after last client disconnect",
        )
        parser.add_argument(
            "--inject",
            type=int,
            help="Pid of a running process in which a debugger will be "
            "injected with gdb. This needs a working gdb and ptrace enabled",
        )
        parser.add_argument(
            "--break-at-start",
            action="store_true",
            help="Break at the start of the python file",
        )
        parser.add_argument(
            "--urlsocket",
            type=str,
            help="Path of the socket into which to feed the url for docker browser opening",
        )
        parser.add_argument(
            "command",
            nargs=REMAINDER,
            help="A python file to trace with kalong and its arguments or "
            "nothing to launch a shell instead",
        )
        return parser

    def parse_args(self):
        args = self.get_parser().parse_args()
        if not args.front_host:
            args.front_host = args.host
        if not args.front_port:
            args.front_port = args.port
        if not args.ws_host:
            args.ws_host = args.host
        if not args.ws_port:
            args.ws_port = args.port
        return args

    def from_args(self):
        for name, arg in vars(self.parse_args()).items():
            setattr(self, name, arg)

    def from_env(self):
        for name, value in defaults.items():
            value = os.getenv(f"KALONG_{name.upper()}")
            if value:
                setattr(self, name, type(name)(value))

        if os.getenv("KALONG_HOST") and not os.getenv("KALONG_FRONT_HOST"):
            self.front_host = self.host
        if os.getenv("KALONG_PORT") and not os.getenv("KALONG_FRONT_PORT"):
            self.front_port = self.port
        if os.getenv("KALONG_HOST") and not os.getenv("KALONG_WS_HOST"):
            self.ws_host = self.host
        if os.getenv("KALONG_PORT") and not os.getenv("KALONG_WS_PORT"):
            self.ws_port = self.port

    def get_args_for_server(self):
        yield "--server"

        if self.detached:
            yield "--detached"

        for name, default in defaults.items():
            if name in ["server", "detached", "command"]:
                continue
            value = getattr(self, name)
            if value != default:
                pretty_name = name.replace("_", "-")
                yield f"--{pretty_name}={value}"

    @property
    def log_level(self):
        return getattr(logging, self.log.upper())

    def __str__(self):
        return str(self.__dict__)
