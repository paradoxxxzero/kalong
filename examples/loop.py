a, b = 0, 1
breakpoint()
while a < 10000:
    print(a)
    a, b = b, a + b
