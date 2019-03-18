import React from 'react'
import equal from 'fast-deep-equal'

export default class Line extends React.PureComponent {
  componentDidMount() {
    this.componentDidUpdate({})
  }

  componentDidUpdate({ line: oldLine, classes: oldClasses }) {
    const { codeMirror, line, classes } = this.props
    if (line !== oldLine || !equal(classes, oldClasses)) {
      if (oldLine && oldClasses) {
        Object.entries(oldClasses).forEach(([key, cls]) =>
          codeMirror.removeLineClass(oldLine - 1, key, cls)
        )
      }
      Object.entries(classes).forEach(([key, cls]) =>
        codeMirror.addLineClass(line - 1, key, cls)
      )
    }
  }

  componentWillUnmount() {
    const { codeMirror, line, classes } = this.props
    Object.entries(classes).forEach(([key, cls]) =>
      codeMirror.removeLineClass(line - 1, key, cls)
    )
  }

  render() {
    return null
  }
}
