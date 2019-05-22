export const commandShortcuts = {
  i: 'inspect',
  d: 'diff',
}

export default (state, action) => {
  const newState = (() => {
    switch (action.type) {
      case 'new-value':
        return {
          ...state,
          index: -1,
          value: action.value,
          transientValue: action.value,
        }
      case 'handle-up':
        return {
          ...state,
          index: Math.min(state.index + 1, action.history.length - 1),
          value:
            action.history[
              Math.min(state.index + 1, action.history.length - 1)
            ] || '',
          command: null,
        }
      case 'handle-down':
        return {
          ...state,
          index: Math.max(state.index - 1, -1),
          value:
            action.history[Math.max(state.index - 1, -1)] ||
            state.transientValue,
          command: null,
        }
      case 'jump':
        return {
          ...state,
          index: action.index,
          value: action.value,
          command: null,
        }
      case 'remove-command':
        return {
          ...state,
          command: null,
        }
      case 'reset':
        return {
          index: -1,
          value: '',
          transientValue: '',
          command: null,
        }
      default:
        throw new Error()
    }
  })()
  if (newState.value) {
    const commandMatch = newState.value.match(/^\?(\S+)\s(.*)/)
    if (commandMatch) {
      const [, cmd, expr] = commandMatch
      const fullCommand = commandShortcuts[cmd] || cmd
      const command = Object.values(commandShortcuts).includes(fullCommand)
        ? fullCommand
        : null
      if (command) {
        newState.value = expr
        newState.command = command
      }
    }
  }

  return newState
}

export const initialValue = {
  index: -1,
  value: '',
  transientValue: '',
  command: null,
}
