def subfun(x, y, z=0):
    z += x / z
    return x + y + z


def fun(skip=False):
    a = 4
    b = 9
    breakpoint()
    print(a + b)
    if skip:
        return
    c = a + b
    d = a - c
    subfun(a, b, c)
    print(c * d)
    return (a - b) / (c * d)


fun()
fun(True)
