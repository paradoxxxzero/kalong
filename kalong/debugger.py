import dis
import linecache
import os
import time
from contextlib import redirect_stderr, redirect_stdout
from io import StringIO
from pathlib import Path

try:
    from cutter import cut
    from cutter.utils import bang_compile as compile
except ImportError:
    cut = None


def serialize_frames(current_frame):
    frame = current_frame
    frames = []
    while frame:
        code = frame.f_code
        filename = code.co_filename or '<unspecified>'
        if filename == '<frozen importlib._bootstrap>':
            filename = os.path.join(
                os.path.dirname(linecache.__file__),
                'importlib',
                '_bootstrap.py',
            )
        lno = frame.f_lineno
        line = None
        linecache.checkcache(filename)
        line = linecache.getline(filename, lno, frame.f_globals)
        line = line and line.strip()
        startlnos = dis.findlinestarts(code)
        lastlineno = list(startlnos)[-1][1]
        fn = Path(filename).resolve()
        frames.append(
            {
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
        )
        frame = frame.f_back
    return frames


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
                pass

        locals_ = frame.f_locals
        globals_ = frame.f_globals
        start = time.time()
        if compiled_code is not None:
            try:
                exec(compiled_code, globals_, locals_)
            except Exception:
                # handle ex
                pass
        duration = int((time.time() - start) * 1000 * 1000 * 1000)

    return {
        'prompt': prompt,
        'answer': answer.getvalue(),
        'duration': duration,
    }
