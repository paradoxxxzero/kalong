import os

print("Forking")

pid = os.fork()

if pid == 0:
    print("In children")
    breakpoint()
    print("Children dead")
else:
    print("In parent")
    breakpoint()
    print("Parent dead")

print("The End")
