import { completionKeymap } from '@codemirror/autocomplete'
import { closeBracketsKeymap } from '@codemirror/closebrackets'
import { defaultKeymap } from '@codemirror/commands'
import { commentKeymap } from '@codemirror/comment'
import { foldGutter, foldKeymap } from '@codemirror/fold'
import { lineNumbers } from '@codemirror/gutter'
import { historyKeymap } from '@codemirror/history'
import { python } from '@codemirror/lang-python'
import { lintKeymap } from '@codemirror/lint'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { EditorState } from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark'
import {
  drawSelection,
  EditorView,
  highlightSpecialChars,
  keymap,
} from '@codemirror/view'
import CodeMirror from '@uiw/react-codemirror'
import React, { memo, useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getFile } from './actions'
import { context } from './extensions'

const styleOverrides = EditorView.theme({
  '&,& .cm-content': {
    fontFamily: '"Fira Code", monospace',
  },
})

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
    ...commentKeymap,
    ...completionKeymap,
    ...lintKeymap,
  ]),
  EditorState.readOnly.of(true),
  EditorView.lineWrapping,
  styleOverrides,
  python(),
]

export default memo(function Source({ currentFile, className }) {
  const dispatch = useDispatch()
  const files = useSelector(state => state.files)
  const {
    absoluteFilename,
    lineNumber,
    firstFunctionLineNumber,
    lastFunctionLineNumber,
  } = currentFile
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

  const handleUpdate = useCallback(
    viewUpdate => {
      const { state, view } = viewUpdate
      let pos
      try {
        pos = state.doc.line(lineNumber).from
      } catch (e) {
        return
      }

      const scroller = view.scrollDOM
      const { top } = view.lineBlockAt(pos)
      scroller.scrollTo({
        top: top - scroller.clientHeight / 2,
      })
    },
    [lineNumber]
  )

  return (
    <CodeMirror
      style={{ flex: 1 }}
      editable={false}
      basicSetup={false}
      theme={oneDark}
      height="100%"
      extensions={extensions}
      value={source}
      onUpdate={handleUpdate}
    />
  )
})
