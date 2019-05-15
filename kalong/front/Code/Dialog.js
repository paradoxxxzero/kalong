import 'codemirror/addon/dialog/dialog'
import 'codemirror/addon/dialog/dialog.css'
import { useContext, useEffect } from 'react'

import { CodeContext } from '.'

export default function Dialog({
  template,
  onEnter,
  closeOnEnter,
  closeOnBlur,
  bottom,
  onKeyDown,
  onInput,
  onClose,
}) {
  const codeMirror = useContext(CodeContext)
  useEffect(
    () => {
      const close = codeMirror.openDialog(template, onEnter || (() => {}), {
        closeOnEnter,
        closeOnBlur,
        bottom,
        onKeyDown,
        onInput,
        onClose,
      })
      return () => {
        close()
      }
    },
    [
      codeMirror,
      template,
      onEnter,
      closeOnEnter,
      closeOnBlur,
      bottom,
      onKeyDown,
      onInput,
      onClose,
    ]
  )
  return null
}
