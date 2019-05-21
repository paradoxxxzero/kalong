export default (state, action) => {
  switch (action.type) {
    case 'search':
      return {
        ...state,
        value: '',
        reverse: action.reverse,
        insensitive: action.insensitive,
      }
    case 'found':
      return {
        ...state,
        value: action.value,
        notFound: false,
        highlight: action.highlight,
      }
    case 'empty':
      return {
        ...state,
        value: '',
        notFound: false,
        highlight: null,
      }
    case 'not-found':
      return {
        ...state,
        value: action.value,
        notFound: true,
        highlight: null,
      }
    case 'reset':
      return {
        value: null,
        insensitive: false,
        reverse: false,
        notFound: false,
        highlight: null,
      }
    default:
      throw new Error()
  }
}

export const initialSearch = {
  value: null,
  reverse: false,
  insensitive: false,
  notFound: false,
  highlight: null,
}