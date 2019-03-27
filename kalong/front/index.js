import { Provider } from 'react-redux'
import { applyMiddleware, compose, createStore } from 'redux'
import React from 'react'
import ReactDOM from 'react-dom'

import ThemedApp from './ThemedApp'
import reducer from './reducer'
import websocketMiddleware from './websocketMiddleware'

export const store = createStore(
  reducer,
  (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose)(
    applyMiddleware(websocketMiddleware)
  )
)

ReactDOM.render(
  <Provider store={store}>
    <ThemedApp />
  </Provider>,
  document.getElementById('root')
)
