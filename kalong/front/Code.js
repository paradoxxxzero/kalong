import React from 'react'

import CodeMirror from './codemirror'

export default class Code extends React.PureComponent {
  static defaultProps = {
    mode: 'python',
  }
  constructor(props) {
    super(props)
    this.root = React.createRef()
    this.codeMirror = null
  }

  componentDidMount() {
    const { source, height, width, ...props } = this.props
    this.codeMirror = CodeMirror(this.root.current, {
      ...props,
    })
  }

  componentDidUpdate({
    source: prevSource,
    height: oldHeight,
    width: oldWidth,
    ...oldProps
  }) {
    const { source, height, width, ...props } = this.props
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
    return <div ref={this.root} className="Code" />
  }
}
