import dis
import linecache
import os
import sys
import time
from inspect import (
    getdoc,
    getsource,
    isclass,
    iscoroutine,
    isfunction,
    isgenerator,
    ismethod,
    ismodule,
    signature,
)
from itertools import groupby
from pathlib import Path

from .tools import iter_stack

try:
    from cutter import cut
    from cutter.utils import bang_compile as compile
except ImportError:
    cut = None


def serialize_frames(current_frame, current_tb):
    for frame, lno in iter_stack(current_frame, current_tb):
        code = frame.f_code
        filename = code.co_filename or '<unspecified>'
        if filename == '<frozen importlib._bootstrap>':
            filename = os.path.join(
                os.path.dirname(linecache.__file__),
                'importlib',
                '_bootstrap.py',
            )
        line = None
        linecache.checkcache(filename)
        line = linecache.getline(filename, lno, frame.f_globals)
        line = line and line.strip()
        startlnos = dis.findlinestarts(code)
        lastlineno = list(startlnos)[-1][1]
        fn = Path(filename).resolve()
        yield {
            'key': id(code),
            'filename': str(fn),
            'stem': fn.stem,
            'function': code.co_name,
            'firstFunctionLineNumber': code.co_firstlineno,
            'lastFunctionLineNumber': lastlineno,
            'lineNumber': lno,
            'lineSource': line,
            'active': frame == current_frame,
        }


class ObjCache(object):
    def __init__(self):
        self.cache = {}

    def register(self, obj):
        ident = id(obj)
        self.cache[ident] = obj
        return ident

    def get(self, ident):
        return self.cache[ident]

    def clear(self):
        self.cache = {}


obj_cache = ObjCache()


class FakeSTD(object):
    def __init__(self, answer, type):
        self.answer = answer
        self.type = type

    def write(self, s):
        self.answer.append({'type': self.type, 'text': s})

    def flush(self):
        pass


class capture_display(object):
    def __init__(self, answer):
        self.answer = answer

    def __enter__(self):
        sys.displayhook = self.hook

    def __exit__(self, exctype, excinst, exctb):
        sys.displayhook = sys.__displayhook__

    def hook(self, obj):
        self.answer.append(
            {'type': 'obj', 'value': repr(obj), 'id': obj_cache.register(obj)}
        )


class capture_std(object):
    def __init__(self, answer):
        self.answer = answer

    def __enter__(self):
        sys.stdout = FakeSTD(self.answer, 'out')
        sys.stderr = FakeSTD(self.answer, 'err')

    def __exit__(self, exctype, excinst, exctb):
        sys.stdout = sys.__stdout__
        sys.stderr = sys.__stderr__


def serialize_answer(prompt, frame):
    prompt = prompt.strip()
    duration = 0
    answer = []
    with capture_display(answer), capture_std(answer):
        compiled_code = None
        try:
            compiled_code = compile(prompt, '<stdin>', 'single')
        except Exception:
            try:
                compiled_code = compile(prompt, '<stdin>', 'exec')
            except Exception:
                # handle ex
                sys.excepthook(*sys.exc_info())

        start = time.time()
        if compiled_code is not None:
            try:
                exec(compiled_code, frame.f_globals, frame.f_locals)
            except Exception:
                # handle ex
                sys.excepthook(*sys.exc_info())
        duration = int((time.time() - start) * 1000 * 1000 * 1000)

    return {'prompt': prompt, 'answer': answer, 'duration': duration}


def attribute_classifier(attr):
    key = attr['key']
    value = attr['value']
    if key.startswith('__') and key.endswith('__'):
        return '__core__'
    if ismodule(value):
        return 'module'
    if isclass(value):
        return 'class'
    if ismethod(value):
        return 'method'
    if isfunction(value):
        return 'function'
    if isgenerator(value):
        return 'generator'
    if iscoroutine(value):
        return 'coroutine'
    return 'attribute'


def serialize_attribute(attr, group):
    if group in ['function', 'method', 'coroutine']:
        attr['signature'] = str(signature(attr['value']))
    attr['value'] = repr(attr['value'])
    return attr


def serialize_inspect(key, frame):
    obj = obj_cache.get(key)
    attributes = [
        {
            'key': key,
            'value': getattr(obj, key, '?'),
            'id': obj_cache.register(getattr(obj, key, '?')),
        }
        for key in dir(obj)
    ]

    grouped_attributes = {
        group: [serialize_attribute(attr, group) for attr in attrs]
        for group, attrs in groupby(attributes, key=attribute_classifier)
    }

    doc = getdoc(obj)
    try:
        source = getsource(obj)
    except Exception:
        source = None
    answer = [
        {
            'type': 'inspect',
            'attributes': grouped_attributes,
            'doc': doc,
            'source': source,
        }
    ]

    return {'prompt': repr(obj), 'answer': answer}
