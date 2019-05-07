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

export const SET_PROMPT = 'SET_PROMPT'
export const setPrompt = (key, prompt) => ({
  type: SET_PROMPT,
  key,
  prompt,
  remote: true,
})

export const SET_PROMPT_ANSWER = 'SET_PROMPT_ANSWER'
export const setPromptAnswer = ({ key, prompt, answer, duration }) => ({
  type: SET_PROMPT_ANSWER,
  key,
  prompt,
  answer,
  duration,
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

export const REQUEST_INSPECT_EVAL = 'REQUEST_INSPECT_EVAL'
export const requestInspectEval = (key, prompt) => ({
  type: REQUEST_INSPECT_EVAL,
  key,
  prompt,
  remote: true,
})

export const SET_INSPECT_ANSWER = 'SET_INSPECT_ANSWER'
export const setInspectAnswer = ({ key, prompt, answer }) => ({
  type: SET_INSPECT_ANSWER,
  key,
  prompt,
  answer,
})

export const CLEAR_SCROLLBACK = 'CLEAR_SCROLLBACK'
export const clearScrollback = () => ({
  type: CLEAR_SCROLLBACK,
})

export const REQUEST_SUGGESTION = 'REQUEST_SUGGESTION'
export const requestSuggestion = (prompt, from, to) => ({
  type: REQUEST_SUGGESTION,
  prompt,
  from,
  to,
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
