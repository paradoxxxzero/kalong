import ctypes
from inspect import (
    getcomments,
    getmodule,
    getmro,
    getsourcefile,
    getsourcelines,
    iscode,
    signature,
)

from .doc_lookup import get_fqn, get_online_doc


class ObjCache(object):
    def __init__(self):
        self.cache = {}

    def register(self, obj):
        ident = id(obj)
        self.cache[ident] = obj
        return ident

    def get(self, ident):
        return self.cache[ident]

    def clear(self):
        self.cache = {}


obj_cache = ObjCache()


def walk_iterable(iterable, walked):
    return [walk_obj(obj, walked) for obj in iterable]


def walk_mapping(mapping, walked):
    return [
        {"key": walk_obj(key, walked), "value": walk_obj(val, walked)}
        for key, val in mapping.items()
    ]


def walk_obj(obj, walked):
    id = obj_cache.register(obj)
    if id in walked:
        # Don't walk circular dependencies
        return {"type": "obj", "value": safe_repr(obj), "id": id}
    walked.add(id)

    if any([isinstance(obj, list), isinstance(obj, set), isinstance(obj, tuple)]):
        return {
            "type": "iterable",
            "subtype": type(obj).__name__,
            "values": walk_iterable(obj, walked),
            "id": obj_cache.register(obj),
        }
    if isinstance(obj, dict):
        return {
            "type": "mapping",
            "subtype": type(obj).__name__,
            "values": walk_mapping(obj, walked),
            "id": obj_cache.register(obj),
        }
    return {"type": "obj", "value": safe_repr(obj), "id": id}


def get_bases(cls):
    return {
        "id": obj_cache.register(cls),
        "name": cls.__name__,
        "bases": [get_bases(base) for base in cls.__bases__],
    }


def has_mixins(bases):
    return len(bases["bases"]) > 1 or any(has_mixins(base) for base in bases["bases"])


def get_infos(obj):
    infos = {}
    infos["type"] = type(obj).__name__
    cls = obj if type(obj) is type else type(obj)
    try:
        infos["signature"] = obj.__name__ + str(signature(obj))
    except Exception:
        pass

    infos["fqn"] = get_fqn(obj)
    if infos["fqn"]:
        infos["online_doc"] = get_online_doc(infos["fqn"])
    elif type(obj) is not type:
        type_fqn = get_fqn(type(obj))
        if type_fqn:
            infos["online_doc"] = get_online_doc(type_fqn)

    try:
        infos["bases"] = get_bases(cls)
        if has_mixins(infos["bases"]):
            try:
                infos["mro"] = [
                    {"id": obj_cache.register(m), "type": m.__name__}
                    for m in (getmro(cls))
                ]
            except Exception:
                pass
    except Exception:
        pass

    try:
        infos["file"] = getsourcefile(obj)
    except Exception:
        infos["file"] = ""

    try:
        srcs, lno = getsourcelines(obj)
        infos["file"] += f":{lno}"
        infos["source_size"] = len(srcs)
    except Exception:
        pass

    try:
        infos["module"] += f":{getmodule(obj).__name__}"
    except Exception:
        pass

    infos["comments"] = getcomments(obj)

    infos["id"] = id(obj)

    return infos


def sync_locals(frame, f_locals):
    """
    This is a cpython hack to synchronize new locals back into
    the fast local slots.
    """
    for key, value in f_locals.items():
        frame.f_locals[key] = value
    try:
        ctypes.pythonapi.PyFrame_LocalsToFast(ctypes.py_object(frame), ctypes.c_int(0))
    except Exception:
        pass


def get_code(obj):
    if iscode(obj):
        return obj
    if hasattr(obj, "__func__"):
        obj = obj.__func__
    for attr in ["__code__", "gi_code", "ag_code", "cr_code", "f_code"]:
        if hasattr(obj, attr):
            code = getattr(obj, attr)
            if hasattr(code, "co_code"):
                return code


def safe_getattr(obj, key, default, include_exc=False):
    try:
        return getattr(obj, key)
    except Exception as e:
        if include_exc:
            return f"{default} {e.__class__.__name__}: {e}"
        return default


def safe_repr(obj, default="<unrepresentable>", include_exc=False):
    try:
        return repr(obj)
    except Exception as e:
        if include_exc:
            return f"{default} {e.__class__.__name__}: {e}"
        return default


def safe_bool(obj):
    try:
        return bool(obj)
    except Exception:
        return False
