def add_one(a):
    one = 1
    breakpoint()
    return a + one


prefix = "> "
start = 2
stop = 5

print([prefix + str(add_one(i)) for i in range(start, stop)])
