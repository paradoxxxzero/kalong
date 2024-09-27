import { defaultHighlightStyle } from '@codemirror/language'
import { highlightTree } from '@lezer/highlight'
import { python } from '@codemirror/lang-python'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import React, { forwardRef, useEffect, useState } from 'react'
import { StreamLanguage } from '@codemirror/language'
import { diff } from '@codemirror/legacy-modes/mode/diff'

function runmode(textContent, language, callback) {
  const tree = language.parser.parse(textContent)
  let pos = 0
  highlightTree(tree, defaultHighlightStyle, (from, to, classes) => {
    from > pos && callback(textContent.slice(pos, from), null, pos, from)
    callback(textContent.slice(from, to), classes, from, to)
    pos = to
  })
  pos !== tree.length &&
    callback(textContent.slice(pos, tree.length), null, pos, tree.length)
}

const pyLang = python().language
const diffLang = StreamLanguage.define(diff)

export default forwardRef(function Snippet(
  { sx, value = '', mode = 'python', onClick, noBreak, ...props },
  ref
) {
  const [chunks, setChunks] = useState([[value, null, 0]])
  useEffect(() => {
    const lang = { python: pyLang, diff: diffLang }[mode]
    if (!lang || !value) {
      return
    }
    setChunks([])
    runmode(value, lang, (text, cls, from) => {
      if (noBreak && text.includes('\n')) {
        text = (
          <>
            {text.split('\n').map((line, i, all) => (
              <React.Fragment key={i}>
                {line}
                {i < all.length - 1 ? (
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.75em',
                      pl: 0.25,
                      pr: 1,
                      color: 'info.main',
                      verticalAlign: 'bottom',
                    }}
                  >
                    ⏎
                  </Typography>
                ) : null}
              </React.Fragment>
            ))}
          </>
        )
      }
      setChunks(chunks => [...chunks, [text, cls, from]])
    })
  }, [mode, value])
  return (
    <Box
      ref={ref}
      component="code"
      sx={[
        {
          fontFamily: '"Fira Code", monospace',
          whiteSpace: noBreak ? undefined : 'pre-wrap',
          wordBreak: noBreak || 'break-all',
          overflowWrap: noBreak || 'break-word',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      onClick={onClick}
      {...props}
    >
      {chunks.map(([text, cls, from]) => (
        <span key={from} className={cls}>
          {text}
        </span>
      ))}
    </Box>
  )
})
