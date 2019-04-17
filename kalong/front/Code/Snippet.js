import { withStyles } from '@material-ui/core'
import React from 'react'
import classnames from 'classnames'

import CodeMirror from './codemirror'

@withStyles(() => ({
  snippet: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    overflowWrap: 'break-word',
  },
  breakingSnippet: {
    whiteSpace: 'pre-wrap',
  },
}))
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
    const { mode, value } = this.props
    this.runMode(value, mode)
  }

  componentDidUpdate({ value: oldValue }) {
    const { mode, value } = this.props
    if (value !== oldValue) {
      this.runMode(value, mode)
    }
  }

  runMode(code, mode) {
    CodeMirror.runMode(code ? code.toString() : '', mode, this.code.current)
  }

  render() {
    const { classes, className, theme, onClick, noBreakAll } = this.props
    return (
      <code
        ref={this.code}
        className={classnames(
          `cm-s-${theme}`,
          className,
          noBreakAll ? classes.breakingSnippet : classes.snippet
        )}
        onClick={onClick}
      />
    )
  }
}
