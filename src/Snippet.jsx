import { defaultHighlightStyle, highlightTree } from '@codemirror/highlight'
import { makeStyles } from '@material-ui/core'
import clsx from 'clsx'
import React, { memo, useEffect, useRef, useState } from 'react'
import { python } from '@codemirror/lang-python'

function runmode(textContent, language, callback, options) {
  const tree = language.parser.parse(textContent)
  let pos = 0
  highlightTree(tree, defaultHighlightStyle.match, (from, to, classes) => {
    from > pos && callback(textContent.slice(pos, from), null, pos, from)
    callback(textContent.slice(from, to), classes, from, to)
    pos = to
  })
  pos !== tree.length &&
    callback(textContent.slice(pos, tree.length), null, pos, tree.length)
}

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

const pyLang = python().language
const diffLang = null // TODO: diff().language

export default memo(function Snippet({
  className,
  value = '',
  mode = 'python',
  onClick,
  noBreakAll,
  noBreak,
}) {
  const [chunks, setChunks] = useState([[value, null, 0]])
  const classes = useStyles()
  useEffect(() => {
    const lang = { python: pyLang, diff: diffLang }[mode]
    if (!lang) {
      return
    }
    setChunks([])
    runmode(value, lang, (text, cls, from) => {
      setChunks(chunks => [...chunks, [text, cls, from]])
    })
  }, [mode, value])
  return (
    <code
      className={clsx(
        classes.snippet,
        className,
        !noBreak &&
          (noBreakAll ? classes.breakingSnippet : classes.nonBreakingSnippet)
      )}
      onClick={onClick}
    >
      {chunks.map(([text, cls, from]) => (
        <span key={from} className={cls}>
          {text}
        </span>
      ))}
    </code>
  )
})
