import { useContext, useLayoutEffect } from 'react'

import { CodeContext } from '.'

export default function Highlight({ mode, opaque, priority }) {
  const codeMirror = useContext(CodeContext)
  useLayoutEffect(() => {
    codeMirror.addOverlay(mode, {
      opaque,
      priority,
    })
    return () => {
      codeMirror.removeOverlay(mode)
    }
  }, [codeMirror, mode, opaque, priority])
  return null
}
