from .multifile_utils import odd_uppercase, remove_last_character


hello = "world"


def compute(word):
    reversed_word = ''.join(reversed(word))
    odd_cased_word = odd_uppercase(reversed_word)
    return remove_last_character(odd_cased_word)


result = compute(hello)
print(result)
