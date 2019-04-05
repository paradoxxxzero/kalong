import ctypes
from inspect import (
    getcomments,
    getmodule,
    getmro,
    getsourcefile,
    getsourcelines,
    signature,
)


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
        {'key': walk_obj(key, walked), 'value': walk_obj(val, walked)}
        for key, val in mapping.items()
    ]


def walk_obj(obj, walked):
    id = obj_cache.register(obj)
    if id in walked:
        # Don't walk circular dependencies
        return {'type': 'obj', 'value': repr(obj), 'id': id}
    walked.add(id)

    if any(
        [isinstance(obj, list), isinstance(obj, set), isinstance(obj, tuple)]
    ):
        return {
            'type': 'iterable',
            'subtype': type(obj).__name__,
            'values': walk_iterable(obj, walked),
            'id': obj_cache.register(obj),
        }
    if isinstance(obj, dict):
        return {
            'type': 'mapping',
            'subtype': type(obj).__name__,
            'values': walk_mapping(obj, walked),
            'id': obj_cache.register(obj),
        }
    return {'type': 'obj', 'value': repr(obj), 'id': id}


def get_infos(obj):
    infos = {}
    infos['Type'] = type(obj).__name__
    try:
        infos['Signature'] = str(signature(obj))
    except Exception:
        pass
    try:
        infos['MRO'] = ', '.join(
            m.__name__
            for m in (getmro(obj) if type(obj) == type else getmro(type(obj)))
        )
    except Exception:
        pass
    try:
        infos['File'] = getsourcefile(obj)
    except Exception:
        infos['File'] = ''

    try:
        srcs, lno = getsourcelines(obj)
        infos['File'] += f':{lno}'
        infos['Source size'] = f'{len(srcs)} lines'
    except Exception:
        pass

    try:
        infos['Module'] += f':{getmodule(obj).__name__}'
    except Exception:
        pass

    infos['Comments'] = getcomments(obj)

    return infos


def sync_locals(frame, f_locals):
    """
        This is a cpython hack to synchronize new locals back into
        the fast local slots.
    """
    try:
        frame.f_locals.clear()
        ctypes.pythonapi.PyFrame_LocalsToFast(
            ctypes.py_object(frame), ctypes.c_int(1)
        )
        frame.f_locals.update(**f_locals)
        ctypes.pythonapi.PyFrame_LocalsToFast(
            ctypes.py_object(frame), ctypes.c_int(0)
        )
    except Exception:
        pass
