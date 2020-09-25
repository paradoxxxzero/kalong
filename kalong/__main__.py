import os
from pathlib import Path
from subprocess import run

from . import config, run_file, shell

os.environ["PYTHONBREAKPOINT"] = "kalong.breakpoint"
config.from_args()

if config.server:
    from .server import serve

    serve()

elif config.inject:
    kalong_dir = Path(__file__).resolve().parent.parent
    gdb_command = ["gdb", "-p", str(config.inject), "-batch"] + [
        "-eval-command=call %s" % hook
        for hook in [
            "(int) PyGILState_Ensure()",  # Getting the GIL
            '(int) PyRun_SimpleString("'
            f"print('* Kalong injection from {os.getpid()} *');"
            "import sys;"  # Putting kalong project directory in sys path:
            f"sys.path.insert(0, '{kalong_dir}');"
            "import kalong;"  # Setting breakpoint:
            "kalong.break_above(2);"
            '")',
            # Releasing the GIL with the PyGILState_Ensure handle:
            "(void) PyGILState_Release($1)",
        ]
    ]
    print(f'Running: {" ".join(gdb_command)}')
    run(gdb_command)

else:
    if config.command:
        run_file(*config.command)
    else:
        shell()
