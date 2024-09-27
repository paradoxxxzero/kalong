def odd_uppercase(s):
    return "".join([c.upper() if i % 2 else c.lower() for i, c in enumerate(s.split())])


def remove_last_character(s):
    breakpoint()
    return s[:-1]
