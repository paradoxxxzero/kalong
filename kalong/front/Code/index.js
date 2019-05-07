import React from 'react'

import { CodeContext, withContext } from './context'
import CodeMirror from './codemirror'
import Gutter from './Gutter'
import Hint from './Hint'
import Dialog from './Dialog'
import Highlight from './Highlight'
import InView from './InView'
import Line from './Line'
import Source from './Source'

export default class Code extends React.PureComponent {
  static Source = withContext(Source)
  static Line = withContext(Line)
  static Gutter = withContext(Gutter)
  static InView = withContext(InView)
  static Hint = withContext(Hint)
  static Dialog = withContext(Dialog)
  static Highlight = withContext(Highlight)

  static defaultProps = {
    theme: 'default',
    mode: 'python',
  }

  constructor(props) {
    super(props)
    this.root = React.createRef()
    this.codeMirror = null
    this.skipEventOnce = false
    this.handleChange = this.handleChange.bind(this)
  }

  componentDidMount() {
    this.codeMirror = CodeMirror(this.root.current)
    this.codeMirror.on('change', this.handleChange)
    this.componentDidUpdate({})
    this.forceUpdate()
  }

  componentDidUpdate({
    value: oldValue,
    height: oldHeight,
    width: oldWidth,
    className: oldClassName,
    children: oldChildren,
    ...oldProps
  }) {
    const { value, height, width, className, children, ...props } = this.props
    if (value !== oldValue) {
      if (value !== this.codeMirror.getValue()) {
        this.codeMirror.setValue(value || '')
        // Set cursor at end
        this.codeMirror.setCursor({
          line: this.codeMirror.lastLine(),
          ch: this.codeMirror.getLine(this.codeMirror.lastLine()).length,
        })
        this.skipEventOnce = true
      }
    }
    if (width !== oldWidth || height !== oldHeight) {
      this.codeMirror.setSize(width, height)
      this.codeMirror.refresh()
    }
    Object.entries(props)
      .filter(([name]) => !name.startsWith('on'))
      .filter(([name, option]) => oldProps[name] !== option)
      .forEach(([name, option]) => {
        this.codeMirror.setOption(name, option)
      })

    Object.entries(props)
      .filter(([name]) => name.startsWith('on') && name !== 'onChange')
      .filter(([name, handler]) => oldProps[name] !== handler)
      .forEach(([name, handler]) => {
        this.codeMirror.off(
          name.replace(/^on/, '').toLowerCase(),
          oldProps[name]
        )
        this.codeMirror.on(name.replace(/^on/, '').toLowerCase(), handler)
      })
    this.codeMirror.refresh()
    if (props.autofocus) {
      this.codeMirror.focus()
    }
  }

  componentWillUnmount() {
    this.codeMirror.off('change', this.handleChange)
    Object.entries(this.props)
      .filter(([name]) => name.startsWith('on') && name !== 'onChange')
      .forEach(([name, handler]) => {
        this.codeMirror.off(name.replace(/^on/, '').toLowerCase(), handler)
      })
  }

  handleChange(codeMirror, change) {
    const { onChange } = this.props
    if (this.skipEventOnce) {
      this.skipEventOnce = false
    } else {
      onChange && onChange(codeMirror.getValue(), change)
    }
  }

  render() {
    const { className, children } = this.props
    return (
      <div ref={this.root} className={className}>
        {this.codeMirror && (
          <CodeContext.Provider value={{ codeMirror: this.codeMirror }}>
            {children}
          </CodeContext.Provider>
        )}
      </div>
    )
  }
}
