import React from 'react'

import { CodeContext, withContext } from './context'
import CodeMirror from './codemirror'
import Gutter from './Gutter'
import Line from './Line'
import Source from './Source'

export default class Code extends React.PureComponent {
  static Source = withContext(Source)
  static Line = withContext(Line)
  static Gutter = withContext(Gutter)

  static defaultProps = {
    mode: 'python',
  }

  constructor(props) {
    super(props)
    this.root = React.createRef()
    this.codeMirror = null
  }

  componentDidMount() {
    this.codeMirror = CodeMirror(this.root.current)
    this.componentDidUpdate({})
    this.forceUpdate()
  }

  componentDidUpdate({
    height: oldHeight,
    width: oldWidth,
    children: oldChildren,
    ...oldProps
  }) {
    const { height, width, children, ...props } = this.props
    if (width !== oldWidth || height !== oldHeight) {
      this.codeMirror.setSize(width, height)
      this.codeMirror.refresh()
    }
    Object.entries(props).forEach(([name, value]) => {
      if (oldProps[name] !== value) {
        this.codeMirror.setOption(name, value)
      }
    })
  }

  render() {
    const { children } = this.props
    return (
      <div ref={this.root} className="Code">
        {this.codeMirror && (
          <CodeContext.Provider value={{ codeMirror: this.codeMirror }}>
            {children}
          </CodeContext.Provider>
        )}
      </div>
    )
  }
}
