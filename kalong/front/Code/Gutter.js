import { useContext, useLayoutEffect } from 'react'

import { CodeContext } from '.'

export default function Gutter({ line, gutter, marker }) {
  const codeMirror = useContext(CodeContext)
  useLayoutEffect(() => {
    codeMirror.setGutterMarker(
      line - 1,
      gutter,
      document.createTextNode(marker)
    )
    return () => {
      codeMirror.setGutterMarker(line - 1, gutter, null)
    }
  }, [codeMirror, line, gutter, marker])
  return null
}
