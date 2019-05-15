import { makeStyles } from '@material-ui/core'
import React, { useRef, useEffect } from 'react'
import classnames from 'classnames'

import CodeMirror from './codemirror'

const useStyles = makeStyles(() => ({
  snippet: {
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
  mode = mode || 'python'
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
        className,
        noBreakAll ? classes.breakingSnippet : classes.snippet
      )}
      onClick={onClick}
    />
  )
}
