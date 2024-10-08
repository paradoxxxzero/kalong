export const HELLO = 'HELLO'
export const hello = () => ({
  type: HELLO,
  remote: true,
})

export const SET_INFO = 'SET_INFO'
export const setInfo = (config, main) => ({
  type: SET_INFO,
  config,
  main,
})

export const PAUSE = 'PAUSE'
export const pause = () => ({
  type: PAUSE,
})

export const SET_TITLE = 'SET_TITLE'
export const setTitle = title => ({
  type: SET_TITLE,
  title,
})

export const SET_THEME = 'SET_THEME'
export const setTheme = theme => ({
  type: SET_THEME,
  theme,
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
export const doCommand = (command, frame) => ({
  type: DO_COMMAND,
  command,
  frame,
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

export const SET_PROMPT = 'SET_PROMPT'
export const setPrompt = (key, prompt, command, frame, level = 0) => ({
  type: SET_PROMPT,
  key,
  prompt,
  command,
  frame,
  level,
  remote: true,
})

export const REFRESH_PROMPT = 'REFRESH_PROMPT'
export const refreshPrompt = (key, prompt, command, frame) => ({
  type: REFRESH_PROMPT,
  key,
  prompt,
  command,
  frame,
  remote: true,
})

export const REMOVE_PROMPT_ANSWER = 'REMOVE_PROMPT_ANSWER'
export const removePromptAnswer = key => ({
  type: REMOVE_PROMPT_ANSWER,
  key,
})

export const SET_CONNECTION_STATE = 'SET_CONNECTION_STATE'
export const setConnectionState = state => ({
  type: SET_CONNECTION_STATE,
  state,
})

export const REQUEST_INSPECT = 'REQUEST_INSPECT'
export const requestInspect = (key, id) => ({
  type: REQUEST_INSPECT,
  key,
  id,
  remote: true,
})

export const SET_ANSWER = 'SET_ANSWER'
export const setAnswer = ({ key, prompt, command, answer }) => ({
  type: SET_ANSWER,
  key,
  prompt,
  command,
  answer,
})

export const SET_WATCHING = 'SET_WATCHING'
export const setWatching = (key, watching) => ({
  type: SET_WATCHING,
  key,
  watching,
})

export const CLEAR_SCROLLBACK = 'CLEAR_SCROLLBACK'
export const clearScrollback = () => ({
  type: CLEAR_SCROLLBACK,
})

export const REQUEST_SUGGESTION = 'REQUEST_SUGGESTION'
export const requestSuggestion = (prompt, from, to, cursor, frame) => ({
  type: REQUEST_SUGGESTION,
  prompt,
  from,
  to,
  cursor,
  frame,
  remote: true,
})

export const SET_SUGGESTION = 'SET_SUGGESTION'
export const setSuggestion = ({ prompt, from, to, suggestion }) => ({
  type: SET_SUGGESTION,
  prompt,
  from,
  to,
  suggestion,
})

export const CLEAR_SUGGESTION = 'CLEAR_SUGGESTION'
export const clearSuggestion = () => ({
  type: CLEAR_SUGGESTION,
})
