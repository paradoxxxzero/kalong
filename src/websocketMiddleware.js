import { SET_CONNECTION_STATE } from './actions'

export default store => {
  const ws = new WebSocket(
    `${window.location.protocol.replace(
      'http',
      'ws'
    )}//${window.location.host.replace(3000, 59999)}${window.location.pathname}`
  )
  window.ws = ws
  ws.onopen = () => {
    store.dispatch({ type: SET_CONNECTION_STATE, state: 'open' })
  }

  ws.onmessage = ({ data }) => {
    const action = JSON.parse(data)
    store.dispatch(action)
  }

  ws.onclose = () => {
    store.dispatch({ type: SET_CONNECTION_STATE, state: 'closed' })
  }

  return next => action => {
    if (action.remote) {
      ws.send(JSON.stringify(action))
    }
    return next(action)
  }
}
