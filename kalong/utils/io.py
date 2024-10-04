import sys

from .obj import safe_bool, walk_obj


class FakeSTD(object):
    def __init__(self, answer, type):
        self.answer = answer
        self.type = type

    def write(self, s):
        self.answer.append({"type": self.type, "text": s})

    def flush(self):
        pass


class capture_display(object):
    def __init__(self, answer):
        self.obj = None
        self.answer = answer

    def __enter__(self):
        sys.displayhook = self.hook
        return self

    def __exit__(self, exctype, excinst, exctb):
        sys.displayhook = sys.__displayhook__

    def hook(self, obj):
        if obj is not None:
            answer = walk_obj(obj, set())
            answer["truthiness"] = safe_bool(obj)
            self.answer.append(answer)
        self.obj = obj


class capture_std(object):
    def __init__(self, answer):
        self.answer = answer

    def __enter__(self):
        sys.stdout = FakeSTD(self.answer, "out")
        sys.stderr = FakeSTD(self.answer, "err")

    def __exit__(self, exctype, excinst, exctb):
        sys.stdout = sys.__stdout__
        sys.stderr = sys.__stderr__


class capture_exception(object):
    def __init__(self, answer):
        self.answer = answer

    def __enter__(self):
        sys.excepthook = self.hook

    def __exit__(self, exctype, excinst, exctb):
        sys.excepthook = sys.__excepthook__

    def hook(self, type_, value, tb):
        from ..debugger import serialize_exception

        self.answer.append(serialize_exception(type_, value, tb))
