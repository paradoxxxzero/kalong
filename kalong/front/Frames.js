import { connect } from 'react-redux'
import List from '@material-ui/core/List'
import React from 'react'
import equal from 'fast-deep-equal'

import { getFrames, setActiveFrame } from './actions'
import Frame from './Frame'

@connect(
  state => ({
    activeFrame: state.activeFrame,
    frames: state.frames,
  }),
  dispatch => ({
    requestFrames: () => dispatch(getFrames()),
    selectFrame: key => dispatch(setActiveFrame(key)),
  })
)
export default class Frames extends React.PureComponent {
  componentDidMount() {
    const { frames, requestFrames } = this.props

    if (!frames.length) {
      requestFrames()
    }
  }

  componentDidUpdate({ frames: oldFrames }) {
    const { frames, selectFrame } = this.props
    if (!equal(frames, oldFrames)) {
      selectFrame(frames[0].key)
    }
  }

  render() {
    const { frames } = this.props
    return (
      <List>
        {frames.map((frame, i) => (
          <Frame key={frame.key} frame={frame} last={i === frames.length - 1} />
        ))}
      </List>
    )
  }
}
