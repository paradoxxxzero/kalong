import { setConnectionState } from './actions'

export default function websocketMiddleware(store) {
  let closing = false
  const verbose = ['debug', 'info'].includes(store.getState().config.log)
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
    if (verbose) {
      const { type, ...data } = action
      console && console.log('->', type, data)
    }
    store.dispatch(action)
  }

  ws.onclose = () => {
    store.dispatch(setConnectionState('closed'))
    setTimeout(() => closing || window.close(), 10)
  }
  window.addEventListener('beforeunload', function (e) {
    delete e.returnValue
    if (ws.readyState === WebSocket.OPEN) {
      try {
        closing = true
        ws.close()
      } catch (e) {}
    }
  })

  return next => action => {
    if (action.remote) {
      const packet = JSON.stringify(action)
      if (ws.readyState === 1) {
        if (verbose) {
          const { type, ...data } = action
          console && console.log('<-', type, data)
        }
        ws.send(packet)
      } else {
        if (verbose) {
          const { type, ...data } = action
          console && console.log('><', type, data)
        }
        queue.push(packet)
        if (ws.readyState === 3) {
          ws = window.ws = connect()
        }
      }
    }
    return next(action)
  }
}
