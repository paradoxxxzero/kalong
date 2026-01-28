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

from .errors import SetFrameError
from .utils import cutter_mock, dedent, discompile, universal_travel
from .utils.io import capture_display, capture_exception, capture_std
from .utils.iterators import force_iterable, iter_cause, iter_frame, iter_stack
from .utils.obj import (
    get_code,
    get_infos,
    obj_cache,
    safe_getattr,
    safe_repr,
    sync_locals,
)

try:
    from cutter import cut
    from cutter.utils import bang_compile as compile
except ImportError:
    cut = None

log = logging.getLogger(__name__)
diff_separator = "≏"
table_separator = "⌅"


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


def get_frame(frame, key, tb=None):
    if not key:
        return frame

    for f, _lno in iter_stack(frame, tb):
        if id(f) == key:
            return f
    log.warning(f"Frame {key} not found")
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
        lnos = list(startlnos)
        lastlineno = None
        if lnos:
            lastlineno = lnos[-1][1]

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


def serialize_answer_recursive(prompt, frame):
    return serialize_answer(prompt, frame, True)


def _rec_exec(code, globals, locals):
    from .stepping import start_trace, steppings, stop_trace
    from .utils import current_origin

    frame = sys._getframe()
    stop_trace(frame)

    origin = current_origin()
    steppings[origin] = {
        "type": "stepInto",
        "frame": frame,
        "lno": frame.f_lineno,
        "skip_frames": 1,  # Skip exec frame
        "_parent": steppings.get(origin),
    }

    start_trace(frame)
    try:
        exec(code, globals, locals)
    finally:
        parent = steppings[origin].get("_parent")
        if parent:
            steppings[origin] = parent
        else:
            stop_trace(frame)


def rec_exec(code, globals, locals):
    sys.call_tracing(_rec_exec, (code, globals, locals))


def serialize_answer(prompt, frame, recursive=False):
    duration = 0
    answer = []
    f_globals = dict(frame.f_globals)
    f_locals = dict(frame.f_locals)
    f_globals.update(f_locals)
    f_locals["__kalong_current_frame__"] = frame
    f_locals["cut"] = cut
    last_key = ""
    if "__kalong_last_value__" in frame.f_globals:
        last_key = "_" if "_" not in f_locals else "__"
        f_locals[last_key] = frame.f_globals["__kalong_last_value__"]

    with capture_exception(answer), capture_display(answer) as out, capture_std(answer):
        compiled_code = None
        try:
            compiled_code = compile(prompt.strip(), "<stdin>", "single")
            prompt = prompt.strip()
        except SetFrameError:
            raise
        except Exception:
            try:
                prompt = dedent(prompt)
                compiled_code = compile(prompt, "<stdin>", "exec")
            except SetFrameError:
                raise
            except Exception:
                # handle ex
                sys.excepthook(*sys.exc_info())

        start = time.time()
        if compiled_code is not None:
            try:
                (rec_exec if recursive else exec)(compiled_code, f_globals, f_locals)
            except SetFrameError:
                raise
            except Exception:
                # handle ex
                sys.excepthook(*sys.exc_info())
            if "__kalong_current_frame__" in f_locals:
                del f_locals["__kalong_current_frame__"]
            if "cut" in f_locals:
                del f_locals["cut"]
            if last_key and last_key in f_locals:
                del f_locals[last_key]
            sync_locals(frame, f_locals)
            if out.obj is not None:
                frame.f_globals["__kalong_last_value__"] = out.obj
        duration = int((time.time() - start) * 1000 * 1000 * 1000)

    return {
        "prompt": prompt,
        "answer": answer,
        "duration": duration,
        "recursive": recursive,
    }


def serialize_exception(type_, value, tb, subtype="root"):
    return {
        "type": "exception",
        "id": obj_cache.register(value),
        "subtype": subtype,
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
    if key.startswith("_"):
        return "_private"
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
    attr["value"] = safe_repr(attr["value"], "<unrepresentable>", True)
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
    return serialize_inspect(key, frame)


def serialize_inspect(key, frame):
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
                    + f"getattr(obj, {key!r}) raises",
                    True,
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
    for frame_ in iter_frame(frame):
        if obj in frame_.f_locals.values():
            break
    else:
        frame_ = None

    return {
        "prompt": safe_repr(obj, "<unrepresentable>"),
        "answer": answer,
        "frame": id(frame_),
    }


def serialize_diff_eval(prompt, frame):
    leftStr, rightStr = (s.strip() for s in prompt.split(diff_separator))

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
                    (pformat(left, indent=2, width=80) + "\n").splitlines(
                        keepends=True
                    ),
                    (pformat(right, indent=2, width=80) + "\n").splitlines(
                        keepends=True
                    ),
                    fromfile=leftStr,
                    tofile=rightStr,
                )
            ),
        }
    ]

    return {
        "prompt": f"{leftStr} {diff_separator} {rightStr}",
        "answer": answer,
    }


def serialize_suggestion(prompt, from_, to, cursor, frame):
    answer = {"prompt": prompt, "from": from_, "to": to, "suggestion": {}}
    # Partial cutter completion support
    if cut and "!" in prompt:
        prompt, cursor = cutter_mock(prompt, cursor)
    try:
        script = Interpreter(prompt, [frame.f_locals, frame.f_globals])
        completions = script.complete(cursor["line"] + 1, cursor["ch"])

        params_first_completions = [
            c for c in completions if c.name_with_symbols != c.name
        ] + [c for c in completions if c.name_with_symbols == c.name]

        completions = [
            {
                "text": comp.name_with_symbols,
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


def serialize_table(prompt, frame):
    if table_separator in prompt:
        valueStr, columns = (s.strip() for s in prompt.split(table_separator))
        columns = [c.strip() for c in columns.split(",")]
    else:
        valueStr = prompt.strip()
        columns = None

    try:
        valueKey = get_id_from_expression(valueStr, frame)
    except Exception:
        return {
            "prompt": valueStr,
            "answer": [serialize_exception(*sys.exc_info())],
        }

    value = obj_cache.get(valueKey)
    values = list(force_iterable(value, True))
    if not columns:
        if all(isinstance(value, dict) for value in values):
            columns = list({column for value in values for column in value.keys()})
        else:
            columns = list(
                {
                    column
                    for value in values
                    for column in dir(value)
                    if not column.startswith("__")
                }
            )

    answer = [
        {
            "type": "table",
            "columns": columns,
            "rows": [
                {
                    column: {
                        "value": None
                        if value == "___void___"
                        else safe_repr(value, "<unrepresentable>", True),
                        "id": obj_cache.register(value),
                    }
                    for column in columns
                    for value in [universal_travel(row, column)]
                }
                for row in values
            ],
        }
    ]

    return {
        "prompt": f"{valueStr} {table_separator} {', '.join(columns)}",
        "answer": answer,
    }
