import os
import subprocess
import sys


def forkserver():
    """
    Fork a detached server.py server that will continue to run as long
    as it has clients.
    """
    popen_args = (
        {
            'creationflags': subprocess.DETACHED_PROCESS
            | subprocess.CREATE_NEW_PROCESS_GROUP
        }  # Test this
        if sys.platform[:3] == 'win'
        else {'start_new_session': True}
    )
    print([sys.executable, '-m', 'kalong', '--server', *sys.argv[1:]])
    server = subprocess.Popen(
        [sys.executable, '-m', 'kalong', '--server', *sys.argv[1:]],
        close_fds=True,
        env=os.environ,
        **popen_args,
    )
    # Raise error here?
    return server.poll()
