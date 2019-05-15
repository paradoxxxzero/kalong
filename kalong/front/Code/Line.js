import { useContext, useLayoutEffect } from 'react'

import { CodeContext } from '.'

export default function Line({ line, classes }) {
  const codeMirror = useContext(CodeContext)
  useLayoutEffect(
    () => {
      Object.entries(classes).forEach(([key, cls]) =>
        codeMirror.addLineClass(line - 1, key, cls)
      )
      return () => {
        Object.entries(classes).forEach(([key, cls]) =>
          codeMirror.removeLineClass(line - 1, key, cls)
        )
      }
    },
    [codeMirror, line, classes]
  )
  return null
}
