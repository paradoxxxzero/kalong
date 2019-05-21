import { setConnectionState } from './actions'

export default store => {
  const queue = []
  const connect = () =>
    new WebSocket(
      `${window.location.protocol.replace(
        'http',
        'ws'
      )}//${window.location.host.replace(59998, 59999)}${
        window.location.pathname
      }`
      // TODO: remove the 59998 dev hack
    )
  let ws = (window.ws = connect())
  ws.onopen = () => {
    store.dispatch(setConnectionState('open'))
    while (queue.length) {
      ws.send(queue.shift())
    }
  }

  ws.onmessage = ({ data }) => {
    const action = JSON.parse(data)
    store.dispatch(action)
  }

  ws.onclose = () => {
    store.dispatch(setConnectionState('closed'))
    setTimeout(() => window.close(), 10)
  }

  return next => action => {
    if (action.remote) {
      const packet = JSON.stringify(action)
      if (ws.readyState === 1) {
        ws.send(packet)
      } else {
        queue.push(packet)
        if (ws.readyState === 3) {
          ws = window.ws = connect()
        }
      }
    }
    return next(action)
  }
}
