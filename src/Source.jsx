import { closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, historyKeymap } from '@codemirror/commands'
import { foldKeymap } from '@codemirror/language'
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
import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getFile, toggleBreakpoint } from './actions'
import {
  highlightActiveLineGutter,
  lineWrappingHarder,
  contextState,
  showContext,
  contextEffect,
  breakpointGutter,
  breakpointEffect,
  breakpointState,
} from './extensions'
import { cmTheme } from './codemirror'
import { Paper, useColorScheme, useTheme } from '@mui/material'

const mousedown = (view, line) => {
  view.state
    .field(contextState)
    .dispatch(
      toggleBreakpoint(
        view.state.field(contextState).filename,
        view.state.doc.lineAt(line.from).number
      )
    )
}
const baseExtensions = [
  highlightSpecialChars(),
  drawSelection(),
  highlightSelectionMatches(),
  highlightActiveLineGutter(),
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
  breakpointGutter({
    domEventHandlers: {
      mousedown,
    },
  }),
  lineNumbers({
    domEventHandlers: {
      mousedown,
    },
  }),
  contextState,
  showContext,
]

export default function Source({ currentFile }) {
  const dispatch = useDispatch()
  const files = useSelector(state => state.files)
  const breakpoints = useSelector(state => state.breakpoints)
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

  useEffect(() => {
    let timeout = null
    // Use a timeout here because view is null while file is loading.
    const setLine = () => {
      if (sourceRef.current?.view?.state.doc.lines >= lineNumber) {
        const { view } = sourceRef.current
        view.dispatch({
          effects: contextEffect.of({
            active: lineNumber,
            first: firstFunctionLineNumber,
            last: lastFunctionLineNumber,
            filename: absoluteFilename,
            dispatch,
          }),
        })
      } else {
        timeout = setTimeout(() => {
          timeout = null
          setLine()
        }, 10)
      }
    }
    setLine()
    return () => {
      timeout && clearTimeout(timeout)
    }
  }, [
    absoluteFilename,
    dispatch,
    firstFunctionLineNumber,
    lastFunctionLineNumber,
    lineNumber,
  ])

  useEffect(() => {
    let timeout = null
    // Use a timeout here because view is null while file is loading.
    const setLine = () => {
      if (sourceRef.current?.view?.state.doc.lines >= lineNumber) {
        const { view } = sourceRef.current
        const pos = view.state.doc.line(lineNumber).from
        view.dispatch({
          effects: EditorView.scrollIntoView(pos, { y: 'center' }),
        })
      } else {
        timeout = setTimeout(() => {
          timeout = null
          setLine()
        }, 10)
      }
    }

    setLine()
    return () => {
      timeout && clearTimeout(timeout)
    }
  }, [lineNumber])

  useEffect(() => {
    let timeout = null
    // Use a timeout here because view is null while file is loading.
    const setBreakpoints = () => {
      if (sourceRef.current?.view?.state.doc.lines > 1) {
        const { view } = sourceRef.current
        const fileBreakpoints = (breakpoints[absoluteFilename] || []).filter(
          bp => 1 <= bp && bp <= view.state.doc.lines
        )

        const editorBreakpoints = []
        view.state
          .field(breakpointState)
          .between(0, view.state.doc.length, pos => {
            const line = view.state.doc.lineAt(pos).number
            editorBreakpoints.push(line)
          })
        const breakpointsToAdd = fileBreakpoints.filter(
          bp => !editorBreakpoints.includes(bp)
        )
        const breakpointsToRemove = editorBreakpoints.filter(
          bp => !fileBreakpoints.includes(bp)
        )
        view.dispatch({
          effects: breakpointsToAdd
            .map(bp =>
              breakpointEffect.of({
                pos: view.state.doc.line(bp).from,
                on: true,
              })
            )
            .concat(
              breakpointsToRemove.map(bp =>
                breakpointEffect.of({
                  pos: view.state.doc.line(bp).from,
                  on: false,
                })
              )
            ),
        })
      } else {
        timeout = setTimeout(() => {
          timeout = null
          setBreakpoints()
        }, 10)
      }
    }

    setBreakpoints()
    return () => {
      timeout && clearTimeout(timeout)
    }
  }, [breakpoints, absoluteFilename])

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
        extensions={baseExtensions}
        value={source || ''}
      />
    </Paper>
  )
}
