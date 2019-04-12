class Root(object):
    pass


class A(Root):
    pass


class B(Root):
    pass


class C(object):
    pass


class D(A):
    pass


class E(B, C):
    pass


class F(A, C, B):
    pass


class G(D, F):
    pass


class H(G):
    pass


breakpoint()
