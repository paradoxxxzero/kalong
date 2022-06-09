import difflib
import dis
import linecache
import logging
import os
import sys
import time
from inspect import (
    getdoc,
    getsource,
    isclass,
    iscoroutine,
    isgenerator,
    ismodule,
    isroutine,
    signature,
)
from itertools import groupby
from pathlib import Path
from pprint import pformat

from jedi import Interpreter

from .utils import discompile
from .utils.io import capture_display, capture_exception, capture_std
from .utils.iterators import iter_cause, iter_stack, iter_frame
from .utils.obj import (
    get_code,
    get_infos,
    obj_cache,
    safe_getattr,
    sync_locals,
)
from .errors import SetFrameError

try:
    from cutter import cut
    from cutter.utils import bang_compile as compile
except ImportError:
    cut = None

log = logging.getLogger(__name__)


def get_title(frame, event, arg):
    if event == "line":
        return "Tracing"
    elif event == "call":
        return f"Calling {frame.f_code.co_name}"
    elif event == "return":
        return f"Returning from {frame.f_code.co_name}"
    elif event == "exception":
        return f"{arg[0].__name__}: {arg[1]}"
    elif event == "shell":
        return "Shell"
    return "???"


def get_frame(frame, key):
    if not key:
        return frame

    for f in iter_frame(frame):
        if id(f) == key:
            return f
    log.warn(f"Frame {key} not found")
    return frame


def serialize_frames(current_frame, current_tb):
    for frame, lno in iter_stack(current_frame, current_tb):
        code = frame.f_code
        filename = code.co_filename or "<unspecified>"
        if filename == "<frozen importlib._bootstrap>":
            filename = os.path.join(
                os.path.dirname(linecache.__file__),
                "importlib",
                "_bootstrap.py",
            )
        fn = Path(filename)
        if not filename.startswith("<"):
            fn = fn.resolve()

        line = None
        linecache.checkcache(filename)
        line = linecache.getline(filename, lno, frame.f_globals)
        line = line and line.strip()
        startlnos = dis.findlinestarts(code)
        lastlineno = list(startlnos)[-1][1]
        yield {
            "key": id(frame),
            "absoluteFilename": str(fn),
            "filename": fn.name,
            "function": code.co_name,
            "firstFunctionLineNumber": code.co_firstlineno,
            "lastFunctionLineNumber": lastlineno,
            "lineNumber": lno,
            "lineSource": line,
            "active": frame == current_frame,
        }


def serialize_answer(prompt, frame):
    prompt = prompt.strip()
    duration = 0
    answer = []
    f_globals = dict(frame.f_globals)
    f_locals = dict(frame.f_locals)
    f_globals.update(f_locals)
    f_locals["_current_frame"] = frame
    f_locals["cut"] = cut

    with capture_exception(answer), capture_display(answer), capture_std(
        answer
    ):
        compiled_code = None
        try:
            compiled_code = compile(prompt, "<stdin>", "single")
        except SetFrameError:
            raise
        except Exception:
            try:
                compiled_code = compile(prompt, "<stdin>", "exec")
            except SetFrameError:
                raise
            except Exception:
                # handle ex
                sys.excepthook(*sys.exc_info())

        start = time.time()
        if compiled_code is not None:
            try:
                exec(compiled_code, f_globals, f_locals)
            except SetFrameError:
                raise
            except Exception:
                # handle ex
                sys.excepthook(*sys.exc_info())
            del f_locals["_current_frame"]
            del f_locals["cut"]
            sync_locals(frame, f_locals)
        duration = int((time.time() - start) * 1000 * 1000 * 1000)

    return {"prompt": prompt, "answer": answer, "duration": duration}


def serialize_exception(type_, value, tb):
    return {
        "type": "exception",
        "id": obj_cache.register(value),
        "subtype": "root",
        "name": type_.__name__,
        "description": str(value),
        "traceback": list(serialize_frames(None, tb)),
        "causes": [
            {
                "id": obj_cache.register(cause),
                "subtype": "cause" if explicit else "context",
                "name": type(cause).__name__,
                "description": str(cause),
                "traceback": list(serialize_frames(None, cause.__traceback__)),
            }
            for cause, explicit in iter_cause(value)
        ],
    }


def attribute_classifier(attr):
    key = attr["key"]
    value = attr["value"]
    if key.startswith("__") and key.endswith("__"):
        return "__core__"
    if ismodule(value):
        return "module"
    if isclass(value):
        return "class"
    if isroutine(value):
        return "method"
    # if isfunction(value):
    #     return 'function'
    if isgenerator(value):
        return "generator"
    if iscoroutine(value):
        return "coroutine"
    return "attribute"


def serialize_attribute(attr, group):
    if group in ["function", "method", "coroutine"]:
        try:
            attr["signature"] = str(signature(attr["value"]))
        except Exception:
            pass
    attr["value"] = repr(attr["value"])
    return attr


def get_id_from_expression(expr, frame):
    return obj_cache.register(eval(expr, frame.f_globals, frame.f_locals))


def serialize_inspect_eval(prompt, frame):
    try:
        key = get_id_from_expression(prompt, frame)
    except Exception:
        return {
            "prompt": prompt,
            "answer": [serialize_exception(*sys.exc_info())],
        }
    return serialize_inspect(key)


def serialize_inspect(key):
    obj = obj_cache.get(key)
    attributes = [
        {"key": key, "value": value, "id": obj_cache.register(value)}
        for key, value in [
            (
                key,
                safe_getattr(
                    obj,
                    key,
                    f"?! Broken obj: key {key!r} is listed in dir() but "
                    + f"getattr(obj, {key!r}) raises.",
                ),
            )
            for key in dir(obj)
        ]
    ]

    grouped_attributes = {
        group: [serialize_attribute(attr, group) for attr in attrs]
        for group, attrs in groupby(
            sorted(attributes, key=attribute_classifier),
            key=attribute_classifier,
        )
    }
    infos = get_infos(obj)
    doc = getdoc(obj)
    source = None
    try:
        source = getsource(obj)
    except Exception:
        try:
            code = get_code(obj)
            if code:
                uncompiled = discompile(code)
                source = f"# Decompiled from {obj!r}\n\n{uncompiled}"
        except Exception:
            raise  # TODO REMOVE

    answer = [
        {
            "type": "inspect",
            "infos": infos,
            "attributes": grouped_attributes,
            "doc": doc,
            "source": source,
        }
    ]

    return {"prompt": repr(obj), "answer": answer}


def serialize_diff_eval(leftStr, rightStr, frame):
    try:
        leftKey = get_id_from_expression(leftStr, frame)
    except Exception:
        return {
            "prompt": leftStr,
            "answer": [serialize_exception(*sys.exc_info())],
        }

    try:
        rightKey = get_id_from_expression(rightStr, frame)
    except Exception:
        return {
            "prompt": rightStr,
            "answer": [serialize_exception(*sys.exc_info())],
        }

    left = obj_cache.get(leftKey)
    right = obj_cache.get(rightKey)

    answer = [
        {
            "type": "diff",
            "diff": "".join(
                difflib.unified_diff(
                    (pformat(left, indent=2, width=5) + "\n").splitlines(
                        keepends=True
                    ),
                    (pformat(right, indent=2, width=5) + "\n").splitlines(
                        keepends=True
                    ),
                    fromfile=leftStr,
                    tofile=rightStr,
                )
            ),
        }
    ]

    return {"prompt": f"{leftStr} ? {rightStr}", "answer": answer}


def serialize_suggestion(prompt, from_, to, cursor, frame):
    answer = {"prompt": prompt, "from": from_, "to": to, "suggestion": {}}
    try:
        script = Interpreter(prompt, [frame.f_locals, frame.f_globals])
        completions = script.complete(cursor["line"] + 1, cursor["ch"])

        params_first_completions = [
            c for c in completions if c.name_with_symbols != c.name
        ] + [c for c in completions if c.name_with_symbols == c.name]

        completions = [
            {
                "text": comp.name_with_symbols,
                "description": comp.description,
                "docstring": comp.docstring(),
                "type": comp.type,
                "base": comp.name_with_symbols[
                    : len(comp.name_with_symbols) - len(comp.complete)
                ],
                "complete": comp.complete,
            }
            for comp in params_first_completions
        ]

        suggestion = {"from": from_, "to": to, "list": completions}
        answer["suggestion"] = suggestion
    except Exception:
        log.exception("Completion failed")
        return answer

    return answer
