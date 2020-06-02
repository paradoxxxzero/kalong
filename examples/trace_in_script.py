def fun1(a):
    b = 4
    c = a + b
    for i in range(10):
        c += b
    return c + 1


def fun2(l):
    breakpoint()
    a = 2
    e = fun1(a)
    return e


def main():
    fun2(0)


main()
breakpoint()
print('The end')
