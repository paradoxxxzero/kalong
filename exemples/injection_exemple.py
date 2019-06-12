import os
from time import sleep

print(f'Run: python -m kalong --inject {os.getpid()}')

i = 1000

while i > 0:
    i -= 1
    # Try to change the value of i
    sleep(i / 1000)
