export default (state, action) => {
  switch (action.type) {
    case 'search':
      return {
        ...state,
        reverse: action.reverse,
        insensitive: action.insensitive,
      }
    case 'found':
      return {
        ...state,
        search: action.search,
        searchNotFound: false,
        searchHighlight: action.highlight,
      }
    case 'empty':
      return {
        ...state,
        search: '',
        searchNotFound: false,
        searchHighlight: null,
      }
    case 'not-found':
      return {
        ...state,
        search: action.search,
        searchNotFound: true,
        searchHighlight: null,
      }
    case 'reset':
      return {
        search: '',
        insensitive: false,
        reverse: null,
        searchNotFound: false,
        searchHighlight: null,
      }
    default:
      throw new Error()
  }
}
