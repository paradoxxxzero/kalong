import React from 'react'

import CodeMirror from './codemirror'

export default class Snippet extends React.PureComponent {
  static defaultProps = {
    theme: 'default',
    mode: 'python',
  }

  constructor(props) {
    super(props)
    this.code = React.createRef()
  }

  componentDidMount() {
    const { mode, children } = this.props
    CodeMirror.runMode(children, mode, this.code.current)
  }

  componentDidUpdate({ children: oldChildren }) {
    const { mode, children } = this.props
    if (children !== oldChildren) {
      CodeMirror.runMode(children, mode, this.code.current)
    }
  }

  render() {
    const { theme } = this.props
    return <code ref={this.code} className={`cm-s-${theme}`} />
  }
}
