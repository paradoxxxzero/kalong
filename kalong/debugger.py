import ctypes
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

from .utils.io import capture_display, capture_std
from .utils.iterators import iter_stack
from .utils.obj import get_infos, obj_cache, sync_locals

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


def serialize_answer(prompt, frame):
    prompt = prompt.strip()
    duration = 0
    answer = []
    f_locals = dict(frame.f_locals)
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
                exec(compiled_code, frame.f_globals, f_locals)
            except Exception:
                # handle ex
                sys.excepthook(*sys.exc_info())
            sync_locals(frame, f_locals)
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
    infos = get_infos(obj)
    doc = getdoc(obj)
    try:
        source = getsource(obj)
    except Exception:
        source = None
    answer = [
        {
            'type': 'inspect',
            'infos': infos,
            'attributes': grouped_attributes,
            'doc': doc,
            'source': source,
        }
    ]

    return {'prompt': repr(obj), 'answer': answer}
