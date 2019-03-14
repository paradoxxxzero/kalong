import { combineReducers } from 'redux'

import {
  SET_ACTIVE_FRAME,
  SET_CONNECTION_STATE,
  SET_FILE,
  SET_FRAMES,
  SET_TITLE,
} from './actions'

const title = (state = 'Tracing', action) => {
  switch (action.type) {
    case SET_TITLE:
      return action.title

    case SET_CONNECTION_STATE: // To remove
      return action.state
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
  switch (action.type) {
    case SET_FRAMES:
      if (state === null) {
        const currentFrame = action.frames.find(({ active }) => active)
        if (currentFrame) {
          return currentFrame.key
        }
      }
      return state
    case SET_ACTIVE_FRAME:
      return action.key
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
export default combineReducers({
  title,
  frames,
  files,
  activeFrame,
  connection,
})
