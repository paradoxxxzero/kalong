import { combineReducers } from 'redux'

import {
  CLEAR_SUGGESTION,
  REMOVE_PROMPT_ANSWER,
  REQUEST_INSPECT,
  REQUEST_INSPECT_EVAL,
  SET_ACTIVE_FRAME,
  SET_CONNECTION_STATE,
  SET_FILE,
  SET_FRAMES,
  SET_INSPECT_ANSWER,
  SET_PROMPT,
  SET_PROMPT_ANSWER,
  SET_SUGGESTION,
  SET_THEME,
  SET_TITLE,
} from './actions'

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
        { key: action.key, prompt: action.prompt, answer: null },
      ]
    case SET_PROMPT_ANSWER:
      return state.map(promptAnswer =>
        action.key === promptAnswer.key
          ? {
              key: action.key,
              prompt: action.prompt,
              answer: action.answer,
              duration: action.duration,
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
    case REQUEST_INSPECT_EVAL:
      return [
        ...state,
        { key: action.key, prompt: `${action.prompt}…`, answer: null },
      ]
    case SET_INSPECT_ANSWER:
      return state.map(promptAnswer =>
        action.key === promptAnswer.key
          ? {
              key: action.key,
              prompt: action.prompt,
              command: action.command,
              answer: action.answer,
            }
          : promptAnswer
      )
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

const history = (state = [], action) => {
  switch (action.type) {
    case SET_PROMPT:
      return [
        action.prompt,
        ...state.filter(historyPrompt => historyPrompt !== action.prompt),
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

export default combineReducers({
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
})
