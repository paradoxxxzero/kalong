import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import { store } from './store'
import ThemedApp from './ThemedApp'

const storageSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error)
  }
}
store.subscribe(() => {
  const state = store.getState()
  storageSet('history', state.history)
  storageSet('spacing', state.spacing)
  storageSet('invert', state.invert)
  storageSet(
    'scrollback',
    state.scrollback
      .filter(({ watching }) => watching?.includes('pin.'))
      .map(answer => ({
        ...answer,
        prompt: answer.prompt.replace(/…$/, ''),
      }))
  )
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

export const VERSION = '0.7.0'
