import React from 'react'

export default class InView extends React.PureComponent {
  componentDidMount() {
    this.componentDidUpdate({})
  }

  componentDidUpdate({ line: oldLine }) {
    const { codeMirror, line } = this.props
    if (oldLine !== line) {
      codeMirror.scrollIntoView(
        line,
        codeMirror.getScrollerElement().clientHeight / 2
      )
    }
  }

  render() {
    return null
  }
}
