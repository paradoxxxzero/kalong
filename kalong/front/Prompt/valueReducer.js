export default (state, action) => {
  switch (action.type) {
    case 'new-command':
      return {
        index: -1,
        value: action.value,
        transientValue: action.value,
        command: action.command,
      }
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
      }
    case 'handle-down':
      return {
        ...state,
        index: Math.max(state.index - 1, -1),
        value:
          action.history[Math.max(state.index - 1, -1)] || state.transientValue,
      }
    case 'jump':
      return {
        ...state,
        index: action.index,
        value: action.value,
      }
    case 'remove-command':
      return {
        ...state,
        command: null,
      }
    case 'prepare-exit':
      return {
        index: -1,
        value: 'import sys; sys.exit(1)',
        transientValue: 'import sys; sys.exit(1)',
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
}

export const initialValue = {
  index: -1,
  value: '',
  transientValue: '',
  command: null,
}
