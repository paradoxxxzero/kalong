import React from 'react'

import CodeMirror from './codemirror'

export default class Snippet extends React.PureComponent {
  constructor(props) {
    super(props)
    this.code = React.createRef()
  }

  componentDidMount() {
    const { children } = this.props
    CodeMirror.runMode(children, 'python', this.code.current)
  }

  componentDidUpgrade({ children: oldChildren }) {
    const { children } = this.props
    if (children !== oldChildren) {
      CodeMirror.runMode(children, 'python', this.code.current)
    }
  }

  render() {
    return <code ref={this.code} className="Snippet" />
  }
}
