from kalong import trace


def catched_exception(i):
    try:
        return i / 0
    except ZeroDivisionError:
        return 2


def uncatched_exception(i):
    return i / 0


def uninteresting_function(i):
    b = catched_exception(i)
    return b


def uninteresting_function_not_catching(i):
    b = uncatched_exception(i)
    return b


def uninteresting_function_catching(i):
    try:
        b = uncatched_exception(i)
    except ZeroDivisionError:
        b = 2
    return b


breakpoint()
catched_exception(10)
uncatched_exception(11)
uninteresting_function(15)
uninteresting_function_catching(180)
uninteresting_function_not_catching(0)
