import { combineReducers } from 'redux'

import {
  CLEAR_SCROLLBACK,
  CLEAR_SUGGESTION,
  DO_COMMAND,
  PAUSE,
  REFRESH_PROMPT,
  REMOVE_PROMPT_ANSWER,
  REQUEST_INSPECT,
  SET_ACTIVE_FRAME,
  SET_ANSWER,
  SET_CONNECTION_STATE,
  SET_FILE,
  SET_FRAMES,
  SET_INFO,
  SET_PROMPT,
  SET_SUGGESTION,
  SET_THEME,
  SET_TITLE,
  SET_WATCHING,
} from './actions'

const config = (state = {}, action) => {
  switch (action.type) {
    case SET_INFO:
      return action.config
    default:
      return state
  }
}

const title = (state = 'Initializing', action) => {
  switch (action.type) {
    case SET_TITLE:
      return action.title
    default:
      return state
  }
}

const frames = (state = [], action) => {
  switch (action.type) {
    case SET_FRAMES:
      return action.frames
    default:
      return state
  }
}

const files = (state = {}, action) => {
  switch (action.type) {
    case SET_FILE:
      return { ...state, [action.filename]: action.source }
    default:
      return state
  }
}

const activeFrame = (state = null, action) => {
  let currentFrame
  switch (action.type) {
    case SET_FRAMES:
      currentFrame = action.frames.find(({ active }) => active)
      if (currentFrame) {
        return currentFrame.key
      }
      return state
    case SET_ACTIVE_FRAME:
      return action.key
    default:
      return state
  }
}

const scrollback = (state = [], action) => {
  switch (action.type) {
    case SET_PROMPT:
      return [
        ...state,
        {
          key: action.key,
          prompt: `${action.prompt}…`,
          command: action.command,
          frame: action.frame,
          level: action.level,
          answer: null,
        },
      ]

    case REFRESH_PROMPT:
      return state.map(promptAnswer =>
        action.key === promptAnswer.key
          ? {
              ...promptAnswer,
              prompt: `${action.prompt}…`,
              frame: action.frame || promptAnswer.frame,
            }
          : promptAnswer
      )

    case REMOVE_PROMPT_ANSWER:
      return state.filter(promptAnswer => action.key !== promptAnswer.key)
    case REQUEST_INSPECT:
      return [
        ...state,
        { key: action.key, prompt: `${action.id}…`, answer: null },
      ]

    case SET_ANSWER:
      return state.map(promptAnswer =>
        action.key === promptAnswer.key
          ? {
              ...promptAnswer,
              key: action.key,
              prompt: action.prompt,
              command: action.command,
              answer: action.answer,
              frame: action.frame,
              duration: action.duration,
            }
          : promptAnswer
      )

    case SET_WATCHING:
      return state.map(promptAnswer =>
        action.key === promptAnswer.key
          ? {
              ...promptAnswer,
              watching: action.watching,
            }
          : promptAnswer
      )

    case CLEAR_SCROLLBACK:
      return []
    default:
      return state
  }
}

const connection = (state = { state: 'connecting' }, action) => {
  switch (action.type) {
    case SET_CONNECTION_STATE:
      return { ...state, state: action.state }
    default:
      return state
  }
}

const loadingLevel = (state = 0, action) => {
  if (action.remote) {
    return state + 1
  }
  if (action.local) {
    return state - 1
  }
  return state
}

const recursionLevel = (state = 0, action) => {
  switch (action.type) {
    case SET_PROMPT:
      if (action.command === 'recursive_debug') {
        return state + 1
      }
      return state
    case PAUSE:
      if (action.recursive) {
        return state - 1
      }
      return state
    default:
      return state
  }
}

const running = (state = false, action) => {
  if (action.type === DO_COMMAND) {
    // Do a stepping command, python will resume
    return true
  }
  if (action.type === PAUSE) {
    // Start interaction, python is paused
    return false
  }
  return state
}

const history = (state = [], action) => {
  switch (action.type) {
    case SET_PROMPT: {
      if (action.command === 'help') {
        return state
      }
      const prompt =
        action.command && action.command !== 'condition'
          ? `?${action.command} ${action.prompt}`
          : action.prompt
      return [
        prompt,
        ...state.filter(historyPrompt => historyPrompt !== prompt),
      ]
    }

    default:
      return state
  }
}

const suggestions = (state = {}, action) => {
  switch (action.type) {
    case SET_SUGGESTION:
      return {
        prompt: action.prompt,
        from: action.from,
        to: action.to,
        suggestion: action.suggestion,
      }
    case CLEAR_SUGGESTION:
      return {}
    default:
      return state
  }
}

const theme = (state = 'init', action) => {
  switch (action.type) {
    case SET_THEME:
      return action.theme
    default:
      return state
  }
}

const main = (state = true, action) => {
  switch (action.type) {
    case SET_INFO:
      return action.main
    default:
      return state
  }
}

export default combineReducers({
  config,
  title,
  frames,
  files,
  activeFrame,
  scrollback,
  history,
  suggestions,
  theme,
  connection,
  loadingLevel,
  recursionLevel,
  running,
  main,
})
