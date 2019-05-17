const consumeUntil = (it, ...chars) => {
  let consumed = ''
  let inStr = ''
  let inComment = false
  while (
    it.i < it.str.length &&
    !(chars.includes(it.str[it.i]) && !inStr && !inComment)
  ) {
    if (inStr && it.str[it.i] === inStr) {
      inStr = ''
    } else if (!inStr && !inComment && ["'", '"'].includes(it.str[it.i])) {
      inStr = it.str[it.i]
    }
    if (!inComment && !inStr && it.str[it.i] === '#') {
      inComment = true
    }
    if (inComment && it.str[it.i] === '\n') {
      inComment = false
    }

    if (it.str[it.i] === '\\') {
      if (!inComment) {
        consumed += it.str[it.i]
      }
      it.i++
    }
    if (!inComment) {
      consumed += it.str[it.i]
    }
    it.i++
  }

  return consumed
}

const consumeArguments = it => {
  let subargs = []

  if (it.str[it.i] === '(') {
    let fullArg = it.str[it.i]
    it.i++
    while (it.i < it.str.length && it.str[it.i] !== ')') {
      if (it.str[it.i] === '(') {
        subargs = [...subargs, ...consumeArguments(it)]
        fullArg += subargs.slice(-1)[0]
      } else {
        const arg = consumeUntil(it, '(', ',', ')')
        fullArg += arg
        if (arg.trim()) {
          subargs.push(arg.trim())
        }
        if (it.str[it.i] === ',') {
          fullArg += it.str[it.i]
          it.i++
        }
      }
    }
    if (it.str[it.i] === ')') {
      fullArg += it.str[it.i]
      it.i++
    }
    subargs.push(fullArg)
  }
  return subargs
}

export const lexArgs = (str, i) => {
  let args = []
  const it = { str, i: i || 0 }

  while (it.i < it.str.length) {
    consumeUntil(it, '(')
    args = [...args, ...consumeArguments(it)]
    it.i++
  }
  return args
}

export const splitDiff = str => {
  const it = { str, i: 0 }
  const left = consumeUntil(it, '?')
  return [left.trim(), str.slice(it.i + 1).trim()]
}
