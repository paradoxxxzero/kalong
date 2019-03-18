import React from 'react'

export default class Gutter extends React.PureComponent {
  componentDidMount() {
    this.componentDidUpdate({})
  }

  componentDidUpdate({ line: oldLine, gutter: oldGutter, marker: oldMarker }) {
    const { codeMirror, line, gutter, marker } = this.props
    if (line !== oldLine || gutter !== oldGutter || marker !== oldMarker) {
      if (oldLine && oldGutter) {
        codeMirror.setGutterMarker(oldLine - 1, oldGutter, null)
      }
      codeMirror.setGutterMarker(
        line - 1,
        gutter,
        document.createTextNode(marker)
      )
    }
  }

  componentWillUnmount() {
    const { codeMirror, line, gutter } = this.props
    codeMirror.setGutterMarker(line - 1, gutter, null)
  }

  render() {
    return null
  }
}
