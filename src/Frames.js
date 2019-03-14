import { connect } from 'react-redux'
import List from '@material-ui/core/List'
import React, { Component } from 'react'

import { getFrames } from './actions'
import Frame from './Frame'

export default connect(
  state => ({
    frames: state.frames,
  }),
  dispatch => ({
    requestFrames: () => dispatch(getFrames()),
  })
)(
  class Frames extends Component {
    componentDidMount() {
      const { frames, requestFrames } = this.props

      if (!frames.length) {
        requestFrames()
      }
    }
    render() {
      const { frames } = this.props
      return (
        <List>
          {frames.map(frame => (
            <Frame key={frame.key} frame={frame} />
          ))}
        </List>
      )
    }
  }
)
