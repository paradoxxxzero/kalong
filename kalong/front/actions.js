export const SET_TITLE = 'SET_TITLE'
export const setTitle = title => ({
  type: SET_TITLE,
  title,
})

export const GET_FRAMES = 'GET_FRAMES'
export const getFrames = () => ({
  type: GET_FRAMES,
  remote: true,
})

export const SET_FRAMES = 'SET_FRAMES'
export const setFrames = frames => ({
  type: SET_FRAMES,
  frames,
})

export const GET_FILE = 'GET_FILE'
export const getFile = filename => ({
  type: GET_FILE,
  filename,
  remote: true,
})

export const DO_COMMAND = 'DO_COMMAND'
export const doCommand = command => ({
  type: DO_COMMAND,
  command,
  remote: true,
})

export const SET_FILE = 'SET_FILE'
export const setFile = (filename, source) => ({
  type: SET_FILE,
  filename,
  source,
})

export const SET_ACTIVE_FRAME = 'SET_ACTIVE_FRAME'
export const setActiveFrame = key => ({
  type: SET_ACTIVE_FRAME,
  key,
})

export const SET_CONNECTION_STATE = 'SET_CONNECTION_STATE'
export const setConnectionState = state => ({
  type: SET_CONNECTION_STATE,
  state,
})
