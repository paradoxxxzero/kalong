import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import { store } from './store'
import ThemedApp from './ThemedApp'

store.subscribe(() => {
  const state = store.getState()
  const history = state.history
  const spacing = state.spacing
  const invert = state.invert

  try {
    localStorage.setItem('history', JSON.stringify(history))
    localStorage.setItem('spacing', spacing)
    localStorage.setItem('invert', JSON.stringify(invert))
  } catch (error) {
    console.warn('Failed to save spacing:', error)
  }
})

if (
  // eslint-disable-next-line no-undef
  process.env.NODE_ENV === 'production' ||
  !document.getElementById('root').innerHTML
) {
  createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      <ThemedApp />
    </Provider>
  )
}

export const VERSION = '0.6.0'
