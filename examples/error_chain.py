from kalong import start_trace, stop_trace


def f1():
    try:
        1 / 0
    except Exception as e:
        raise ValueError('Bad Value') from e


def f2():
    try:
        f1()
    except Exception as e:
        raise KeyError('f1 is borken') from e


def f3():
    try:
        f2()
    except Exception as e:
        raise NameError('f2 is kaputt') from e


start_trace()
try:
    f3()
except Exception:
    pass
finally:
    stop_trace()
