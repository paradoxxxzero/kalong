import { split } from './utils'

export const commandShortcuts = {
  h: 'help',
  i: 'inspect',
  d: 'diff',
  t: 'table',
  r: 'recursive_debug',
}

export const commandShortcutsReverse = Object.fromEntries(
  Object.entries(commandShortcuts).map(([k, v]) => [v, k])
)

export const diffSeparator = '≏'
export const tableSeparator = '⌅'

export default function valueReducer(state, action) {
  const newState = (() => {
    switch (action.type) {
      case 'new-value':
        return {
          ...state,
          index: -1,
          value: action.value,
          transientValue: action.value,
          passive: false,
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
          passive: true,
        }
      case 'handle-down':
        return {
          ...state,
          index: Math.max(state.index - 1, -1),
          value:
            action.history[Math.max(state.index - 1, -1)] ||
            state.transientValue,
          command: null,
          passive: true,
        }
      case 'jump':
        return {
          ...state,
          index: action.index,
          value: action.value,
          command: null,
          passive: true,
        }
      case 'toggle-command':
        return {
          ...state,
          command: state.command === action.command ? null : action.command,
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
          passive: true,
        }
      default:
        throw new Error()
    }
  })()

  if (newState.value) {
    const commandMatch = newState.value.match(/^\?(\S+)(.*)/)
    if (commandMatch) {
      const [, cmd, expr] = commandMatch
      if (Object.keys(commandShortcuts).includes(cmd)) {
        newState.value = expr.trim()
        newState.command = commandShortcuts[cmd]
      }
    }
    if (
      newState.command === 'diff' &&
      !newState.value.includes(diffSeparator)
    ) {
      const [left, right] = split(newState.value)
      if (right) {
        newState.value = `${left} ${diffSeparator} ${right}`
      }
    } else if (
      newState.command === 'table' &&
      !newState.value.includes(tableSeparator)
    ) {
      const [left, right] = split(newState.value)
      if (right) {
        newState.value = `${left} ${tableSeparator} ${right}`
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
  passive: true,
}
