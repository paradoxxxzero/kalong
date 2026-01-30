import { closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, historyKeymap } from '@codemirror/commands'
import { foldGutter, foldKeymap } from '@codemirror/language'
import { lineNumbers } from '@codemirror/view'
import { python } from '@codemirror/lang-python'
import { lintKeymap } from '@codemirror/lint'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { EditorState } from '@codemirror/state'
import {
  EditorView,
  drawSelection,
  highlightSpecialChars,
  keymap,
} from '@codemirror/view'
import CodeMirror from '@uiw/react-codemirror'
import React, { useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getFile } from './actions'
import { context, lineWrappingHarder } from './extensions'
import { cmTheme } from './codemirror'
import { Paper, useColorScheme, useTheme } from '@mui/material'

const baseExtensions = [
  lineNumbers(),
  highlightSpecialChars(),
  foldGutter(),
  drawSelection(),
  highlightSelectionMatches(),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap,
  ]),
  EditorState.readOnly.of(true),
  EditorView.lineWrapping,
  lineWrappingHarder,
  python(),
]

export default function Source({ currentFile }) {
  const dispatch = useDispatch()
  const files = useSelector(state => state.files)
  const theme = useTheme()
  const { colorScheme } = useColorScheme()
  const {
    absoluteFilename,
    lineNumber,
    firstFunctionLineNumber,
    lastFunctionLineNumber,
  } = currentFile
  const sourceRef = useRef()
  const source = files[absoluteFilename]

  useEffect(() => {
    if (absoluteFilename && typeof source === 'undefined') {
      dispatch(getFile(absoluteFilename))
    }
  }, [dispatch, files, absoluteFilename, source])

  const extensions = useMemo(() => {
    return [
      ...baseExtensions,
      context({
        active: lineNumber,
        first: firstFunctionLineNumber,
        last: lastFunctionLineNumber,
      }),
    ]
  }, [lineNumber, firstFunctionLineNumber, lastFunctionLineNumber])

  useEffect(() => {
    let timeout = null
    if (source && sourceRef.current) {
      // Use a timeout here because view is null while file is loading.
      const setLine = () => {
        if (sourceRef.current.view) {
          const pos = source
            .split('\n')
            .slice(0, lineNumber - 1)
            .join('\n').length
          const { view } = sourceRef.current
          view.dispatch(
            view.state.update({
              effects: EditorView.scrollIntoView(pos, { y: 'center' }),
            })
          )
        } else {
          timeout = setTimeout(() => {
            timeout = null
            setLine()
          }, 10)
        }
      }

      setLine()
    }
    return () => {
      timeout && clearTimeout(timeout)
    }
  }, [source, lineNumber])

  if (!colorScheme) {
    return null
  }

  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'row',
        height: '100%',
        minHeight: 0,
        flex: 1,
        colorScheme: `${colorScheme} !important`,
      }}
    >
      <CodeMirror
        ref={sourceRef}
        style={{ flex: 1 }}
        basicSetup={false}
        theme={cmTheme(colorScheme, theme)}
        height="100%"
        extensions={extensions}
        value={source || ''}
      />
    </Paper>
  )
}
