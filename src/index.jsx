import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import { store } from './store'
import ThemedApp from './ThemedApp'

store.subscribe(() => {
  localStorage.setItem('history', JSON.stringify(store.getState().history))
})

const container = document.getElementById('root')
const root = createRoot(container)

const renderRoot = () => {
  root.render(
    <Provider store={store}>
      <ThemedApp />
    </Provider>
  )
}

renderRoot()
