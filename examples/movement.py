# This file does some random operation on a list


def modify_list(ll):
    ll[1] = 7
    ll.insert(0, 3)
    return ll


breakpoint()
l = []
l.append(3)
l += [8, 12]
l = modify_list(l)

for i, e in enumerate(l[:]):
    if i > 2:
        l[i] = i
    else:
        l[i] = e * i

print(l, sum(l))
