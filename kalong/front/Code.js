/* eslint-disable react/no-multi-comp */
import React from 'react'
import equal from 'fast-deep-equal'

import CodeMirror from './codemirror'

const CodeContext = React.createContext({ codeMirror: null })

// eslint-disable-next-line react/display-name
const withContext = Component => props => (
  <CodeContext.Consumer>
    {({ codeMirror }) => <Component codeMirror={codeMirror} {...props} />}
  </CodeContext.Consumer>
)

class Line extends React.PureComponent {
  componentDidMount() {
    this.add(this.props)
  }

  componentDidUpdate(oldProps) {
    if (!equal(oldProps, this.props)) {
      if (oldProps) {
        this.remove(oldProps)
      }
      this.add(this.props)
    }
  }

  componentWillUnmount() {
    this.remove(this.props)
  }

  add({ codeMirror, line, classes }) {
    Object.entries(classes).forEach(([key, cls]) =>
      codeMirror.addLineClass(line - 1, key, cls)
    )
  }

  remove({ codeMirror, line, classes }) {
    Object.entries(classes).forEach(([key, cls]) =>
      codeMirror.removeLineClass(line - 1, key, cls)
    )
  }
  render() {
    return null
  }
}

class Gutter extends React.PureComponent {
  render() {
    return null
  }
}

export default class Code extends React.PureComponent {
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
    source: prevSource,
    height: oldHeight,
    width: oldWidth,
    children: oldChildren,
    ...oldProps
  }) {
    const { source, height, width, children, ...props } = this.props
    if (source !== prevSource) {
      this.codeMirror.setValue(source)
    }
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
