from functools import partial


def iter_linked_list(attr, ll):
    while ll:
        yield ll
        ll = getattr(ll, attr, None)


iter_frame = partial(iter_linked_list, "f_back")
iter_traceback = partial(iter_linked_list, "tb_next")


def iter_stack(frame, tb):
    for t in reversed(list(iter_traceback(tb))):
        if t.tb_frame == frame:
            break
        yield t.tb_frame, t.tb_lineno

    for f in iter_frame(frame):
        yield f, f.f_lineno


def iter_cause(exc):
    while exc:
        if exc.__cause__:
            exc = exc.__cause__
            yield exc, True
        elif exc.__context__:
            exc = exc.__context__
            yield exc, False
        else:
            exc = None


def force_iterable(value, dict_as_not_iterable=False):
    if value is None:
        return ()
    if isinstance(value, dict):
        if dict_as_not_iterable:
            return (value,)
    if isinstance(value, str):
        return (value,)
    try:
        return iter(value)
    except TypeError:
        return (value,)
