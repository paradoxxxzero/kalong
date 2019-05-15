import { useContext, useLayoutEffect } from 'react'

import { CodeContext } from '.'

export default function Source({ code }) {
  const codeMirror = useContext(CodeContext)
  useLayoutEffect(
    () => {
      codeMirror.setValue(code)
      return () => {
        codeMirror.setValue('')
      }
    },
    [codeMirror, code]
  )
  return null
}
