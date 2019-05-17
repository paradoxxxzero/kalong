export const lexArgs = str => {
  let args = []
  let i = 0
  let c = ''

  const consumeUntil = (...chars) => {
    let rv = ''
    let inStr = ''
    let inComment = false

    while (i < str.length && !(chars.includes(c) && !inStr && !inComment)) {
      if (inStr && c === inStr) {
        inStr = ''
      } else if (!inStr && !inComment && ["'", '"'].includes(c)) {
        inStr = c
      }
      if (!inComment && !inStr && c === '#') {
        inComment = true
      }
      if (inComment && c === '\n') {
        inComment = false
      }

      if (c === '\\') {
        if (!inComment) {
          rv += c
        }
        c = str[i++]
      }
      if (!inComment) {
        rv += c
      }
      c = str[i++]
    }

    return rv
  }

  const consumeArguments = () => {
    let subargs = []
    if (c === '(') {
      let fullArg = c
      c = str[i++]
      while (i < str.length && c !== ')') {
        if (c === '(') {
          subargs = [...subargs, ...consumeArguments()]
          fullArg += subargs.slice(-1)[0]
        } else {
          const arg = consumeUntil('(', ',', ')')
          fullArg += arg
          if (arg.trim()) {
            subargs.push(arg.trim())
          }
          if (c === ',') {
            fullArg += c
            c = str[i++]
          }
        }
      }
      if (c === ')') {
        fullArg += c
        c = str[i++]
      }
      subargs.push(fullArg)
    }
    return subargs
  }

  while (i < str.length) {
    c = str[i++]
    consumeUntil('(')
    args = [...args, ...consumeArguments()]
  }
  return args
}

window.lexArgs = lexArgs
