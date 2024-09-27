# This file does some random operation on a list


def modify_list(arg):
    arg[1] = 7
    arg.insert(0, 3)
    return arg


breakpoint()
var = []
var.append(3)
var += [8, 12]
var = modify_list(var)

for i, e in enumerate(var[:]):
    if i > 2:
        var[i] = i
    else:
        var[i] = e * i

print(var, sum(var))
