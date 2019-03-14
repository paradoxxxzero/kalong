import React from 'react'

import CodeMirror from './codemirror'

export default class Code extends React.PureComponent {
  constructor(props) {
    super(props)
    this.root = React.createRef()
    this.codeMirror = null
  }

  componentDidMount() {
    this.codeMirror = CodeMirror(this.root.current, {
      readOnly: true,
      mode: 'python',
    })
  }

  componentDidUpdate({ children: prevChildren }) {
    const { children } = this.props
    if (children !== prevChildren) {
      this.codeMirror.setValue(children)
    }
  }

  render() {
    return <div ref={this.root} />
  }
}
