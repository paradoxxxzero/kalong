def subfun(x, y, z=0):
    z += x / z
    return x + y + z


def _protected(f, *args, **kwargs):
    try:
        return f(*args, **kwargs)
    except Exception:
        return 42


class C:
    def __init__(self):
        self._init = True
        self._store = {}

    def __str__(self):
        r = ",".join(f"{k}={v!r}" for k, v in self._store.items())
        return r

    def __repr__(self):
        r = self.__str__()
        return f"C({r})"

    def __getattr__(self, name):
        if name.startswith("_"):
            return super().__getattr__(name)
        print("GET", name)
        return self._store.get(name, 0)

    def __setattr__(self, name, value):
        if name.startswith("_"):
            return super().__setattr__(name, value)
        print("SET", name, value)
        self._store[name] = value


def fun(skip=False, gen_catched_exception=False, level=0):
    a = 4
    b = 9
    c = C()
    c.a = 1
    c.b = 2 + c.a
    breakpoint()
    print(a + b)
    print(c, "%r" % c)
    if skip:
        return
    c = a + b
    d = a - c
    subfun(a, b, c)
    if gen_catched_exception:
        _protected(subfun, b, a)
    print(c * d)
    if level < 2:
        print("Going deeper")
        fun(level=level + 1)
    return (a - b) / (c * d)


fun()
fun(False, True)
fun(True)
