import inspect
import json
import logging
from pathlib import Path

log = logging.getLogger(__name__)

try:
    with open(Path(__file__).parent / "lookup.json") as f:
        lookup = json.load(f)
except FileNotFoundError:
    log.warning("Can't access doc lookup file", exc_info=True)
    lookup = {}


def get_fqn(obj):
    mod = inspect.getmodule(obj)
    mod_name = getattr(mod, "__name__", "") if mod else ""
    obj_name = getattr(obj, "__qualname__", getattr(obj, "__name__", ""))
    if not mod_name or mod == obj or mod_name == "builtins":
        return obj_name
    return ".".join(s for s in (mod_name, obj_name) if s)


def get_online_doc(fqn):
    return lookup.get(fqn)
