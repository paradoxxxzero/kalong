import { combineReducers } from 'redux'

import {
  SET_ACTIVE_FRAME,
  SET_CONNECTION_STATE,
  SET_FILE,
  SET_FRAMES,
  SET_PROMPT,
  SET_PROMPT_ANSWER,
  SET_TITLE,
} from './actions'

const title = (state = 'Tracing', action) => {
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

export default combineReducers({
  title,
  frames,
  files,
  activeFrame,
  scrollback,
  connection,
  loadingLevel,
})
