import { Provider } from 'react-redux'
import { applyMiddleware, compose, createStore } from 'redux'
import React from 'react'
import { render } from 'react-dom'

import ThemedApp from './ThemedApp'
import reducer from './reducer'
import websocketMiddleware from './websocketMiddleware'

export const store = createStore(
  reducer,
  { history: JSON.parse(localStorage.getItem('history') || '[]') },
  (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose)(
    applyMiddleware(websocketMiddleware)
  )
)

store.subscribe(() => {
  localStorage.setItem('history', JSON.stringify(store.getState().history))
})

const renderRoot = () => {
  render(
    <Provider store={store}>
      <ThemedApp />
    </Provider>,
    document.getElementById('root')
  )
}

renderRoot()
