class A(object):
    def __init__(self, n):
        self.n = n

    def __repr__(self):
        return '<A object with n=%d>' % self.n


def create_a(n):
    a = A(n)
    return a


def combine(a, b):
    return [a, b, A(a.n + b.n)]


def display(a, b=None, *c, **d):
    print(locals())


def work():
    breakpoint()
    a = create_a(5)
    b = create_a(2)
    a, b, c = combine(a, b)
    display(a, b, c=c, cls=A, obj=object)


work()
