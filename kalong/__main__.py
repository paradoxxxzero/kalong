import argparse
import sys

parser = argparse.ArgumentParser(description='Kalong cli')
parser.add_argument(
    '--server',
    action='store_true',
    help='Launch the kalong server. This option is used by kalong itself',
)

args = parser.parse_args()
if args.server:
    from .server import serve

    serve()
    sys.exit(0)
else:
    from . import breakpoint

    breakpoint()
