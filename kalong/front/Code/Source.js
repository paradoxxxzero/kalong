import React from 'react'

export default class Source extends React.PureComponent {
  componentDidMount() {
    this.componentDidUpdate({})
  }

  componentDidUpdate({ code: oldCode }) {
    const { codeMirror, code } = this.props
    if (oldCode !== code) {
      codeMirror.setValue(code)
    }
  }

  componentWillUnmount() {
    const { codeMirror } = this.props
    codeMirror.setValue(null)
  }

  render() {
    return null
  }
}
