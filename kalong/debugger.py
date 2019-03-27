import dis
import linecache
import os
import time
from contextlib import redirect_stderr, redirect_stdout
from io import StringIO
from pathlib import Path
from sys import exc_info, excepthook

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


def serialize_answer(prompt, frame):
    prompt = prompt.strip()
    duration = 0
    answer = StringIO()
    with redirect_stdout(answer), redirect_stderr(answer):
        compiled_code = None
        try:
            compiled_code = compile(prompt, '<stdin>', 'single')
        except Exception:
            try:
                compiled_code = compile(prompt, '<stdin>', 'exec')
            except Exception:
                # handle ex
                excepthook(*exc_info())

        start = time.time()
        if compiled_code is not None:
            try:
                exec(compiled_code, frame.f_globals, frame.f_locals)
            except Exception:
                # handle ex
                excepthook(*exc_info())
        duration = int((time.time() - start) * 1000 * 1000 * 1000)

    return {
        'prompt': prompt,
        'answer': answer.getvalue(),
        'duration': duration,
    }
