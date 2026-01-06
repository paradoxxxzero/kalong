import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import { store } from './store'
import ThemedApp from './ThemedApp'

store.subscribe(() => {
  localStorage.setItem('history', JSON.stringify(store.getState().history))
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

export const VERSION = '0.5.6'
