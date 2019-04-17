import inspect
import json
import logging
from pathlib import Path

log = logging.getLogger(__name__)

try:
    with open(Path(__file__).parent / 'lookup.json') as f:
        lookup = json.load(f)
except FileNotFoundError:
    log.warning("Can't access doc lookup file", exc_info=True)
    lookup = {}


def get_fqn(obj):
    mod = inspect.getmodule(obj)
    if not mod:
        return
    if mod == obj or mod.__name__ == 'bultins':
        return obj.__name__
    return '.'.join((mod.__name__, obj.__name__))


def get_online_doc(fqn):
    return lookup.get(fqn)
