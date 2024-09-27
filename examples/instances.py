class Obj:
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

    def __repr__(self):
        return f"Obj({', '.join(f'{key}={value!r}' for key, value in self.__dict__.items())})"


o = Obj(a=1, b=2)

os = [
    Obj(a=1, b=4),
    Obj(d=3, e=4),
    Obj(f=Obj(a=5, e=6), c=7),
    Obj(a=8, d=9),
]

breakpoint()
