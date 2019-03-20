import logging
import os

protocol = os.getenv('KALONG_PROTOCOL', 'http')
host = os.getenv('KALONG_HOST', 'localhost')
port = os.getenv('KALONG_PORT', 59999)
log_level = getattr(logging, os.getenv('KALONG_LOG', 'WARN'), logging.WARN)

try:
    from log_colorizer import basicConfig
except ImportError:
    from logging import basicConfig  # noqa
