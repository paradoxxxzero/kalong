import dis
import linecache
import os
from pathlib import Path


def get_frame(current_frame):
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
