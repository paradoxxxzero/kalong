from kalong import trace


def catched_exception(below):
    try:
        return below / 0
    except ZeroDivisionError:
        return 2


def uncatched_exception(below):
    return below / 0


def uninteresting_function(below):
    b = catched_exception(below)
    return b


def uninteresting_function_not_catching(below):
    b = uncatched_exception(below)
    return b


def uninteresting_function_catching(below):
    try:
        b = uncatched_exception(below)
    except ZeroDivisionError:
        b = 2
    return b

