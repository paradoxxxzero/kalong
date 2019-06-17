import { makeStyles } from '@material-ui/core'
import React, { useRef, useEffect } from 'react'
import classnames from 'classnames'

import CodeMirror from './codemirror'

const useStyles = makeStyles(() => ({
  snippet: {
    fontFamily: 'Fira Code',
  },
  nonBreakingSnippet: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    overflowWrap: 'break-word',
  },
  breakingSnippet: {
    whiteSpace: 'pre-wrap',
  },
}))

export default function Snippet({
  className,
  value,
  theme,
  mode,
  onClick,
  noBreakAll,
}) {
  theme = theme || 'default'
  mode = mode === void 0 ? 'python' : mode
  const code = useRef()
  const classes = useStyles()
  useEffect(
    () => CodeMirror.runMode(value ? value.toString() : '', mode, code.current),
    [code, mode, value]
  )
  return (
    <code
      ref={code}
      className={classnames(
        `cm-s-${theme}`,
        classes.snippet,
        className,
        noBreakAll ? classes.breakingSnippet : classes.nonBreakingSnippet
      )}
      onClick={onClick}
    />
  )
}
