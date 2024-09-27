import os
import subprocess
import sys
from pathlib import Path

from . import config


def forkserver():
    """
    Fork a detached server.py server that will continue to run as long
    as it has clients.
    """
    # We force the PYTHONPATH here in case of injection from outside
    kalong_dir = Path(__file__).parent.parent
    env = dict(os.environ)
    env["PYTHONPATH"] = (
        f'{kalong_dir}:{env["PYTHONPATH"]}' if env.get("PYTHONPATH") else kalong_dir
    )

    popen_args = (
        {
            "creationflags": subprocess.DETACHED_PROCESS
            | subprocess.CREATE_NEW_PROCESS_GROUP
        }  # Test this
        if sys.platform[:3] == "win"
        else {"start_new_session": True}
    )
    server = subprocess.Popen(
        [sys.executable, "-m", "kalong", *config.get_args_for_server()],
        close_fds=True,
        env=env,
        **popen_args,
    )
    # Raise error here?
    return server.poll()
