import {
  acceptCompletion,
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
  completionStatus,
  startCompletion,
} from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { python } from '@codemirror/lang-python'
import {
  bracketMatching,
  defaultHighlightStyle,
  foldKeymap,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language'
import { lintKeymap } from '@codemirror/lint'
import { highlightSelectionMatches } from '@codemirror/search'
import { EditorState, Prec } from '@codemirror/state'
import {
  drawSelection,
  dropCursor,
  EditorView,
  highlightSpecialChars,
  keymap,
  rectangularSelection,
} from '@codemirror/view'
import { ExpandMore } from '@mui/icons-material'
import { Box, Card, CardHeader, Chip, Grow, IconButton } from '@mui/material'
import CodeMirror from '@uiw/react-codemirror'
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  clearScrollback,
  doCommand,
  requestSuggestion,
  setPrompt,
  removePromptAnswer,
} from '../actions'
import { lineWrappingHarder } from '../extensions'
import { store } from '../store'
import { uid } from '../util'
import searchReducer, { initialSearch } from './searchReducer'
import { lexArgs } from './utils'
import valueReducer, { commandShortcuts, initialValue } from './valueReducer'
import Help from './Help'

const jediTypeToCodeMirrorType = {
  module: 'namespace',
  class: 'class',
  instance: 'variable',
  function: 'function',
  param: 'interface',
  path: 'text',
  keyword: 'keyword',
  property: 'property',
  statement: 'constant',
  // Remaining cm types:
  // constant
  // enum
  // method
  // type
}

const getHighlighter = re => ({
  token: stream => {
    re.lastIndex = stream.pos
    const match = re.exec(stream.string)
    if (match && match.index === stream.pos) {
      stream.pos += match[0].length || 1
      return 'searching'
    } else if (match) {
      stream.pos = match.index
    } else {
      stream.skipToEnd()
    }
  },
})

const styleOverrides = EditorView.theme({
  '&,& .cm-content, & .cm-tooltip.cm-tooltip-autocomplete > ul ': {
    fontFamily: '"Fira Code", monospace',
  },
  '&.cm-editor.cm-focused': {
    outline: 'none',
  },
  '& .cm-tooltip': {
    fontSize: '0.75em',
  },
})

const promptCursorStyles = EditorView.theme({
  '& .cm-cursor': {
    width: '12px',
    border: 'none',
    outline: '1px solid rgba(0, 0, 0, .5)',
    display: 'block',
  },
  '&.cm-focused .cm-cursor': {
    background: 'rgba(0, 0, 0, .75)',
    animation: 'blink 1.5s ease-in-out infinite',
    outline: 0,
  },
})

const baseExtensions = [
  highlightSpecialChars(),
  history(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  rectangularSelection(),
  highlightSelectionMatches(),
  EditorView.lineWrapping,
  lineWrappingHarder,
  styleOverrides,
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap,
  ]),
  python(),
]

export default (function Prompt({ onScrollUp, onScrollDown, scrollToBottom }) {
  const code = useRef()
  const searchCode = useRef()

  const history = useSelector(state => state.history)
  const scrollback = useSelector(state => state.scrollback)
  const activeFrame = useSelector(state => state.activeFrame)

  const dispatch = useDispatch()

  const [prompt, valueDispatch] = useReducer(valueReducer, initialValue)
  const [search, searchDispatch] = useReducer(searchReducer, initialSearch)

  useEffect(() => {
    const handleGlobalEval = ({ keyCode }) => {
      if (keyCode !== 13) {
        return
      }
      const selection = getSelection().toString()
      if (selection) {
        const key = uid()
        dispatch(setPrompt(key, selection, null, activeFrame))
      }
    }
    const handleGlobalFocus = ({ key, target }) => {
      // Don't focus the prompt if the user is typing in the search field
      if (searchCode.current?.view.dom.contains(target)) {
        return
      }
      if (code.current?.view) {
        const { view } = code.current
        if (view.hasFocus) {
          return
        }
        if (document.activeElement.tagName === 'INPUT') {
          return
        }
        // Check if key is a printable char
        if (key.length === 1 || key === 'Spacebar') {
          view.dispatch(
            view.state.replaceSelection(key === 'Spacebar' ? ' ' : key)
          )
        }
        view.focus()
      }
    }
    window.addEventListener('keydown', handleGlobalEval)
    window.addEventListener('keyup', handleGlobalFocus)
    return () => {
      window.removeEventListener('keydown', handleGlobalEval)
      window.removeEventListener('keyup', handleGlobalFocus)
    }
  }, [activeFrame, dispatch])

  const handleChange = useCallback(
    (newValue, viewUpdate) => {
      scrollToBottom()
      if (viewUpdate.selectionSet) {
        valueDispatch({
          type: 'new-value',
          value: newValue,
        })
      }
    },
    [scrollToBottom]
  )

  const handleEnter = useCallback(
    view => {
      if (view.state && completionStatus(view.state) === 'active') {
        return false
      }
      if (!prompt.value) {
        return true
      }
      const key = uid()
      dispatch(setPrompt(key, prompt.value, prompt.command, activeFrame))

      valueDispatch({ type: 'reset' })
      return true
    },
    [activeFrame, dispatch, prompt.command, prompt.value]
  )

  const handleCommand = useMemo(
    () =>
      Object.entries(commandShortcuts).reduce((functions, [key, command]) => {
        functions[key] = () =>
          valueDispatch({ type: 'toggle-command', command })

        return functions
      }, {}),
    [valueDispatch]
  )

  useEffect(() => {
    if (prompt.command === 'help') {
      const key = uid()
      dispatch({
        type: 'SET_PROMPT',
        key,
        frame: null,
        ...prompt,
      })

      dispatch({
        type: 'SET_ANSWER',
        key,
        frame: null,
        duration: 0,
        ...prompt,
        answer: [
          {
            type: 'raw',
            value: <Help />,
          },
        ],
      })

      valueDispatch({ type: 'reset' })
    }
  }, [dispatch, prompt])

  const handleUp = useCallback(
    view => {
      if (completionStatus(view.state) === 'active') {
        return false
      }
      valueDispatch({ type: 'handle-up', history })
      return true
    },
    [history]
  )

  const handleDown = useCallback(
    view => {
      if (completionStatus(view.state) === 'active') {
        return false
      }
      valueDispatch({ type: 'handle-down', history })
      return true
    },
    [history]
  )

  const handleEntered = useCallback(() => {
    if (code.current) {
      code.current.view.focus()
    }
  }, [code])

  const handleBackspace = useCallback(
    view => {
      if (view.state.selection.main.head === 0) {
        if (prompt.command) {
          valueDispatch({ type: 'remove-command' })
          return true
        }
      }
    },
    [prompt.command]
  )

  const handleRemoveLastAnswer = useCallback(
    view => {
      if (scrollback.length) {
        dispatch(removePromptAnswer(scrollback.slice(-1)[0].key))
        return true
      }
    },
    [dispatch, scrollback]
  )

  const handleRemoveCommand = useCallback(() => {
    valueDispatch({ type: 'remove-command' })
    return true
  }, [])

  const handleRemoveAllOrCopy = useCallback(view => {
    if (view.state.selection.main.from !== view.state.selection.main.to) {
      // There's no codemirror command for this
      window.document.execCommand('copy')
    } else {
      valueDispatch({ type: 'reset' })
    }
  }, [])

  const handleDieIfEmpty = useCallback(() => {
    if (!prompt.value) {
      dispatch(doCommand('kill'))
      return true
    }
  }, [dispatch, prompt.value])

  const handleClearScreen = useCallback(() => {
    dispatch(clearScrollback())
    return true
  }, [dispatch])

  const handleIncrementalSearch = useCallback(
    (newSearch, viewUpdate, index = null) => {
      if (viewUpdate && !viewUpdate.selectionSet) {
        return
      }
      if (!newSearch) {
        searchDispatch({ type: 'empty' })
        return
      }
      const valueRE = new RegExp(
        newSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        `g${search.insensitive ? 'i' : ''}`
      )
      index = index === null ? search.index : index
      const historySearched = search.reverse
        ? history.slice(index)
        : [...history].sort(() => -1).slice(history.length - index - 1)
      const newIndex = historySearched.findIndex(p => p && p.match(valueRE))
      if (newIndex === -1) {
        searchDispatch({ type: 'not-found', value: newSearch })
        return
      }
      const finalIndex = search.reverse ? index + newIndex : index - newIndex
      searchDispatch({
        type: 'found',
        value: newSearch,
        highlight: getHighlighter(valueRE),
        index: finalIndex,
      })
      valueDispatch({
        type: 'jump',
        index: finalIndex,
        value: history[finalIndex],
      })
    },
    [history, search]
  )

  const handleSearch = useCallback(
    options => () => {
      const index = options.reset
        ? options.reverse
          ? prompt.index === -1
            ? 0
            : prompt.index
          : prompt.index === -1
          ? history.length - 1
          : prompt.index
        : options.reverse
        ? search.index + 1
        : search.index - 1

      searchDispatch({
        type: 'search',
        reverse: options.reverse || false,
        insensitive: options.insensitive || false,
        reset: options.reset || false,
        history,
        index,
      })
      handleIncrementalSearch(search.value, null, index)
      return true
    },
    [handleIncrementalSearch, history, prompt.index, search.index, search.value]
  )

  const handleSearchClose = useCallback(() => {
    searchDispatch({ type: 'reset' })
    if (code.current) {
      code.current.view.focus()
    }
  }, [code])

  const [historyInsert, setHistoryInsert] = useState(null)
  const handleInsertHistoryArg = useCallback(
    (view, way) => {
      const historyArgs = history.reduce(
        (args, expr) => [...args, ...lexArgs(expr)],
        []
      )
      const initialIndex = way === 'up' ? 0 : history.length - 1
      const incrementalIndex =
        historyInsert !== null &&
        (way === 'up' ? historyInsert + 1 : historyInsert - 1)
      const historyIndex =
        view.state.selection.main.from === view.state.selection.main.to ||
        historyInsert === null
          ? initialIndex
          : incrementalIndex
      const insert = historyArgs[historyIndex]

      if (insert) {
        view.dispatch(view.state.replaceSelection(insert))
        view.dispatch({
          selection: {
            anchor: view.state.selection.main.head - insert.length,
            head: view.state.selection.main.head,
          },
        })
        setHistoryInsert(historyIndex)
      } else {
        view.dispatch(view.state.replaceSelection(''))
      }
    },
    [history, historyInsert, setHistoryInsert]
  )

  const handleInsertHistoryArgUp = useCallback(
    view => {
      handleInsertHistoryArg(view, 'up')
    },
    [handleInsertHistoryArg]
  )

  const handleInsertHistoryArgDown = useCallback(
    view => {
      handleInsertHistoryArg(view, 'down')
    },
    [handleInsertHistoryArg]
  )

  const autocomplete = useCallback(
    async context => {
      let word = context.matchBefore(/[\w?]*/)
      if (word.from === word.to && !context.explicit) return null
      const lineCurrent = context.state.doc.lineAt(
        context.state.selection.main.head
      )
      const lineFrom = context.state.doc.lineAt(word.from)
      const lineTo = context.state.doc.lineAt(word.to)
      const cursor = {
        line: lineCurrent.number - 1,
        ch: context.state.selection.main.head - lineCurrent.from,
      }
      const from = {
        line: lineFrom.number - 1,
        ch: word.from - lineFrom.from,
      }
      const to = {
        line: lineTo.number - 1,
        ch: word.to - lineTo.from,
      }

      if (!prompt.value.includes(' ') && prompt.value.startsWith('?')) {
        return {
          from: word.from,
          options: Object.values(commandShortcuts).map(cmd => ({
            label: `?${cmd}`,
            type: 'namespace',
          })),
        }
      }

      dispatch(requestSuggestion(prompt.value, from, to, cursor, activeFrame))

      const suggestions = await Promise.race([
        new Promise(resolve => setTimeout(() => resolve([]), 5000)),
        new Promise(resolve => {
          const unsub = store.subscribe((...args) => {
            const {
              suggestions: {
                prompt: cPrompt,
                from: cFrom,
                to: cTo,
                suggestion,
              },
            } = store.getState()
            if (
              cPrompt === prompt.value &&
              from.line === cFrom.line &&
              from.ch === cFrom.ch &&
              to.line === cTo.line &&
              to.ch === cTo.ch
            ) {
              resolve(suggestion.list || [])
              unsub()
            }
          })
        }),
      ])
      return {
        from: word.from,
        options: suggestions.map(({ text, docstring, type }) => ({
          label: text,
          info: context.explicit && docstring,
          type: jediTypeToCodeMirrorType[type] || type,
        })),
      }
    },
    [activeFrame, dispatch, prompt.value]
  )

  const handleTabOrComplete = useCallback(
    view => {
      const pos = view.state.selection.main.head
      if (prompt.value.slice(0, pos).split('\n').slice(-1)[0].match(/^\s*$/)) {
        return false
      }
      if (completionStatus(view.state) === 'active') {
        acceptCompletion(view)
      } else {
        startCompletion(view)
      }
      return true
    },
    [prompt.value]
  )

  const grow =
    scrollback.length === 0 || scrollback.slice(-1)[0].answer !== null

  const extensions = useMemo(() => {
    return [
      Prec.highest(
        keymap.of([
          { key: 'ArrowUp', run: handleUp, preventDefault: true },
          { key: 'ArrowDown', run: handleDown, preventDefault: true },
          { key: 'Enter', run: handleEnter, preventDefault: true },
          { key: 'Backspace', run: handleBackspace, preventDefault: true },
          {
            key: 'Shift-Backspace',
            run: handleRemoveLastAnswer,
            preventDefault: true,
          },
          { key: 'Tab', run: handleTabOrComplete, preventDefault: true },
          { key: 'Ctrl-c', run: handleRemoveAllOrCopy, preventDefault: true },
          { key: 'Ctrl-d', run: handleDieIfEmpty, preventDefault: true },
          { key: 'Ctrl-l', run: handleClearScreen, preventDefault: true },
          {
            key: 'Ctrl-r',
            run: handleSearch({
              reverse: true,
              reset: true,
            }),
            preventDefault: true,
          },
          {
            key: 'Ctrl-s',
            run: handleSearch({
              reset: true,
            }),
            preventDefault: true,
          },
          {
            key: 'Shift-Ctrl-r',
            run: handleSearch({
              reverse: true,
              insensitive: true,
              reset: true,
            }),
            preventDefault: true,
          },
          {
            key: 'Shift-Ctrl-s',
            run: handleSearch({
              insensitive: true,
              reset: true,
            }),
            preventDefault: true,
          },
          { key: 'Shift-PageUp', run: onScrollUp, preventDefault: true },
          { key: 'Shift-PageDown', run: onScrollDown, preventDefault: true },
          {
            key: 'Alt-ArrowUp',
            run: handleInsertHistoryArgUp,
            preventDefault: true,
          },
          {
            key: 'Alt-ArrowDown',
            run: handleInsertHistoryArgDown,
            preventDefault: true,
          },
          ...Object.entries(handleCommand).map(([key, cmd]) => ({
            key: `Alt-${key}`,
            run: cmd,
            preventDefault: true,
          })),
        ])
      ),
      autocompletion({ override: [autocomplete] }),
      promptCursorStyles,
      ...baseExtensions,
    ]
  }, [
    autocomplete,
    handleBackspace,
    handleClearScreen,
    handleCommand,
    handleDieIfEmpty,
    handleDown,
    handleEnter,
    handleInsertHistoryArgDown,
    handleInsertHistoryArgUp,
    handleRemoveAllOrCopy,
    handleRemoveLastAnswer,
    handleSearch,
    handleTabOrComplete,
    handleUp,
    onScrollDown,
    onScrollUp,
  ])
  const searchExtensions = useMemo(() => {
    return [
      EditorView.domEventHandlers({
        blur: handleSearchClose,
      }),
      Prec.highest(
        keymap.of([
          { key: 'Enter', run: handleSearchClose, preventDefault: true },
          { key: 'Escape', run: handleSearchClose, preventDefault: true },
          {
            key: 'Ctrl-r',
            run: handleSearch({
              reverse: true,
            }),
            preventDefault: true,
          },
          { key: 'Ctrl-s', run: handleSearch({}), preventDefault: true },
          {
            key: 'Shift-Ctrl-r',
            run: handleSearch({
              reverse: true,
              insensitive: true,
            }),
            preventDefault: true,
          },
          {
            key: 'Shift-Ctrl-s',
            run: handleSearch({
              insensitive: true,
            }),
            preventDefault: true,
          },
        ])
      ),
      ...baseExtensions,
    ]
  }, [handleSearch, handleSearchClose])

  useEffect(() => {
    if (code.current?.view && prompt.passive) {
      const { view } = code.current
      view.dispatch({ selection: { anchor: prompt.value.length } })
    }
  }, [prompt.value, prompt.passive])

  return (
    <Grow
      in={grow}
      exit={false}
      mountOnEnter
      unmountOnExit
      onEntered={handleEntered}
    >
      <Card raised sx={{ m: 1 }}>
        <CardHeader
          avatar={
            <>
              <IconButton
                sx={theme => ({
                  transform: `rotate(${grow ? 270 : 0}deg)`,
                  marginLeft: 'auto',
                  transition: theme.transitions.create('transform', {
                    duration: theme.transitions.duration.shortest,
                  }),
                })}
                onClick={handleEnter}
                size="small"
              >
                <ExpandMore />
              </IconButton>
              {prompt.command && (
                <Chip label={prompt.command} onDelete={handleRemoveCommand} />
              )}
            </>
          }
          title={
            <>
              <CodeMirror
                ref={code}
                value={prompt.value}
                basicSetup={false}
                theme="light"
                onChange={handleChange}
                onCreateEditor={scrollToBottom}
                height="auto"
                extensions={extensions}
                width="100%"
              />
              {search.value !== null && (
                <Box
                  component="label"
                  sx={{
                    fontSize: '.5em',
                    color: search.notFound ? 'error.main' : 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Box component="span" sx={{ px: 0, py: 0.5 }}>
                    {search.insensitive && 'I-'}Search{' '}
                    {search.reverse ? 'backward' : 'forward'}:
                  </Box>
                  <CodeMirror
                    ref={searchCode}
                    value={search.value}
                    height="auto"
                    autoFocus
                    basicSetup={false}
                    extensions={searchExtensions}
                    width="100%"
                    onChange={handleIncrementalSearch}
                  />
                </Box>
              )}
            </>
          }
          titleTypographyProps={{ variant: 'h5' }}
        />
      </Card>
    </Grow>
  )
})
