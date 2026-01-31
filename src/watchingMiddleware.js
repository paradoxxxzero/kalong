import { SET_FRAMES, refreshPrompt } from './actions'

export default function watchingMiddleware(store) {
  return next => action => {
    const rv = next(action)
    if (action.type === SET_FRAMES) {
      const { scrollback, activeFrame } = store.getState()
      scrollback.forEach(({ key, prompt, command, frame, watching }) => {
        if (
          watching?.includes('all') ||
          (watching?.includes('frame') && activeFrame === frame)
        ) {
          store.dispatch(refreshPrompt(key, prompt, command, frame))
        }
      })
    }
    return rv
  }
}
