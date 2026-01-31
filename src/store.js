import { applyMiddleware, compose, createStore } from 'redux'

import reducer from './reducer'
import websocketMiddleware from './websocketMiddleware'
import watchingMiddleware from './watchingMiddleware'

const storageGet = (key, defaultValue) => {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) {
      return defaultValue
    }
    return JSON.parse(raw)
  } catch (error) {
    console.warn(`Failed to load ${key} from localStorage:`, error)
    return defaultValue
  }
}

const spacing = storageGet('spacing', 2)
const invert = storageGet('invert', true)
const history = storageGet('history', [])
const scrollback = storageGet('scrollback', [])

export const store = createStore(
  reducer,
  {
    history,
    spacing,
    invert,
    scrollback,
  },
  (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose)(
    applyMiddleware(websocketMiddleware, watchingMiddleware)
  )
)
