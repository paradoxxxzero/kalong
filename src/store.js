import { applyMiddleware, compose, createStore } from 'redux'

import reducer from './reducer'
import websocketMiddleware from './websocketMiddleware'
import watchingMiddleware from './watchingMiddleware'

let history = undefined
let spacing = undefined

try {
  spacing = localStorage.getItem('spacing') || 'compact'
  history = JSON.parse(localStorage.getItem('history') || '[]')
} catch (error) {
  console.warn('Failed to load from localStorage:', error)
}

export const store = createStore(
  reducer,
  {
    history,
    spacing,
  },
  (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose)(
    applyMiddleware(websocketMiddleware, watchingMiddleware)
  )
)
