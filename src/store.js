import { applyMiddleware, compose, createStore } from 'redux'

import reducer from './reducer'
import websocketMiddleware from './websocketMiddleware'
import watchingMiddleware from './watchingMiddleware'

export const store = createStore(
  reducer,
  { history: JSON.parse(localStorage.getItem('history') || '[]') },
  (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose)(
    applyMiddleware(websocketMiddleware, watchingMiddleware)
  )
)
