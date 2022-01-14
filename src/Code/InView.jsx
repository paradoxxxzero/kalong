import { useContext, useLayoutEffect } from 'react'

import { CodeContext } from '.'

export default function InView({ line }) {
  const codeMirror = useContext(CodeContext)
  useLayoutEffect(() => {
    codeMirror.scrollIntoView(
      line,
      codeMirror.getScrollerElement().clientHeight / 2
    )
  }, [codeMirror, line])
  return null
}
