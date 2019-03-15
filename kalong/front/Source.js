import { connect } from 'react-redux'
import React, { Component } from 'react'
import equal from 'fast-deep-equal'

import { getFile } from './actions'
import Code from './Code'

@connect(
  state => ({
    frames: state.frames,
    files: state.files,
    activeFrame: state.activeFrame,
  }),
  dispatch => ({
    requestFile: filename => dispatch(getFile({ filename })),
  })
)
export default class Source extends Component {
  componentDidMount() {
    this.componentDidUpdate({})
  }

  componentDidUpdate(oldProps) {
    const { frames, files, requestFile, activeFrame } = this.props

    if (!equal(oldProps, this.props)) {
      const current = frames.find(({ key }) => activeFrame === key)

      if (current && current.filename && !files[current.filename]) {
        requestFile(current.filename)
      }
    }
  }

  render() {
    const { frames, files, activeFrame } = this.props
    const current = frames.find(({ key }) => key === activeFrame)

    return (
      <Code
        source={current && files[current.filename]}
        readOnly
        lineNumbers
        theme="material"
      />
    )
  }
}
