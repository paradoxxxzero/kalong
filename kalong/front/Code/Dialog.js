import 'codemirror/addon/dialog/dialog'
import 'codemirror/addon/dialog/dialog.css'
import React from 'react'

export default class Dialog extends React.PureComponent {
  componentDidMount() {
    this.componentDidUpdate({})
  }

  componentDidUpdate({
    template: oldTemplate,
    onEnter: oldOnEnter,
    closeOnEnter: oldCloseOnEnter,
    closeOnBlur: oldCloseOnBlur,
    bottom: oldBottom,
    onKeyDown: oldOnKeyDown,
    onInput: oldOnInput,
    onClose: oldOnClose,
  }) {
    const {
      codeMirror,
      template,
      onEnter,
      closeOnEnter,
      closeOnBlur,
      bottom,
      onKeyDown,
      onInput,
      onClose,
    } = this.props
    if (
      template !== oldTemplate ||
      onEnter !== oldOnEnter ||
      closeOnEnter !== oldCloseOnEnter ||
      closeOnBlur !== oldCloseOnBlur ||
      bottom !== oldBottom ||
      onKeyDown !== oldOnKeyDown ||
      onInput !== oldOnInput ||
      onClose !== oldOnClose
    ) {
      this.close = codeMirror.openDialog(template, onEnter || (() => {}), {
        closeOnEnter,
        closeOnBlur,
        bottom,
        onKeyDown,
        onInput,
        onClose,
      })
    }
  }

  componentWillUnmount() {
    this.close && this.close()
  }

  render() {
    return null
  }
}
