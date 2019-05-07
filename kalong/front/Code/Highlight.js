import React from 'react'

export default class Highlight extends React.PureComponent {
  componentDidMount() {
    this.componentDidUpdate({})
  }

  componentDidUpdate({
    mode: oldMode,
    opaque: oldOpaque,
    priority: oldPriority,
  }) {
    const { codeMirror, mode, opaque, priority } = this.props
    if (mode !== oldMode || opaque !== oldOpaque || priority !== oldPriority) {
      if (this.lastMode) {
        codeMirror.removeOverlay(this.lastMode)
      }
      codeMirror.addOverlay(mode, {
        opaque,
        priority,
      })
      this.lastMode = mode
    }
  }

  componentWillUnmount() {
    const { codeMirror } = this.props
    codeMirror.removeOverlay(this.lastMode)
  }

  render() {
    return null
  }
}
