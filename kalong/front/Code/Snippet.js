import React from 'react'
import classNames from 'classnames'

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
    this.runMode(children, mode)
  }

  componentDidUpdate({ children: oldChildren }) {
    const { mode, children } = this.props
    if (children !== oldChildren) {
      this.runMode(children, mode)
    }
  }

  runMode(code, mode) {
    CodeMirror.runMode(code ? code.toString() : '', mode, this.code.current)
  }

  render() {
    const { className, theme } = this.props
    return (
      <code
        ref={this.code}
        className={classNames(`cm-s-${theme}`, className)}
      />
    )
  }
}
