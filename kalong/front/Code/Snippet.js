import { makeStyles } from '@material-ui/core'
import React, { useRef, useEffect, memo } from 'react'
import clsx from 'clsx'

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

export default memo(function Snippet({
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
      className={clsx(
        `cm-s-${theme}`,
        classes.snippet,
        className,
        noBreakAll ? classes.breakingSnippet : classes.nonBreakingSnippet
      )}
      onClick={onClick}
    />
  )
})
