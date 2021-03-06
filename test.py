def subfun(x, y, z=0):
    z += x / z
    return x + y + z


def protected(f, *args, **kwargs):
    try:
        return f(*args, **kwargs)
    except Exception:
        return 42


def fun(skip=False, gen_catched_exception=False):
    a = 4
    b = 9
    breakpoint()
    print(a + b)
    if skip:
        return
    c = a + b
    d = a - c
    subfun(a, b, c)
    if gen_catched_exception:
        protected(subfun, b, a)
    print(c * d)
    return (a - b) / (c * d)


fun()
fun(False, True)
fun(True)
