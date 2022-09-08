import { combineReducers } from 'redux'

import {
  CLEAR_SCROLLBACK,
  CLEAR_SUGGESTION,
  REMOVE_PROMPT_ANSWER,
  REQUEST_DIFF_EVAL,
  REQUEST_INSPECT,
  REQUEST_INSPECT_EVAL,
  SET_ACTIVE_FRAME,
  SET_CONNECTION_STATE,
  SET_ANSWER,
  SET_FILE,
  SET_FRAMES,
  SET_PROMPT,
  SET_SUGGESTION,
  SET_THEME,
  SET_TITLE,
  DO_COMMAND,
  PAUSE,
  SET_INFO,
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
      // In case of refresh
      if (state.map(({ key }) => key).includes(action.key)) {
        return state.map(promptAnswer =>
          action.key === promptAnswer.key
            ? { ...promptAnswer, prompt: `${action.prompt}…` }
            : promptAnswer
        )
      }

      return [
        ...state,
        { key: action.key, prompt: `${action.prompt}…`, answer: null },
      ]
    case REMOVE_PROMPT_ANSWER:
      return state.filter(promptAnswer => action.key !== promptAnswer.key)
    case REQUEST_INSPECT:
      return [
        ...state,
        { key: action.key, prompt: `${action.id}…`, answer: null },
      ]
    case REQUEST_INSPECT_EVAL:
      return [
        ...state,
        { key: action.key, prompt: `${action.prompt}…`, answer: null },
      ]
    case SET_ANSWER:
      return state.map(promptAnswer =>
        action.key === promptAnswer.key
          ? {
              key: action.key,
              prompt: action.prompt,
              command: action.command,
              answer: action.answer,
              frame: action.frame,
              duration: action.duration,
            }
          : promptAnswer
      )
    case REQUEST_DIFF_EVAL:
      return [
        ...state,
        { key: action.key, prompt: `${action.prompt}…`, answer: null },
      ]

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
    case SET_PROMPT:
      return [
        action.prompt,
        ...state.filter(historyPrompt => historyPrompt !== action.prompt),
      ]
    case REQUEST_INSPECT_EVAL:
      return [
        `?i ${action.prompt}`,
        ...state.filter(
          historyPrompt => historyPrompt !== `?i ${action.prompt}`
        ),
      ]
    case REQUEST_DIFF_EVAL:
      return [
        `?d ${action.left} ? ${action.right}`,
        ...state.filter(
          historyPrompt =>
            historyPrompt !== `?d ${action.left} ? ${action.right}`
        ),
      ]
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
  running,
  main,
})
