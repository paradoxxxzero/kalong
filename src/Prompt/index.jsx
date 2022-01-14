import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/closebrackets'
import { defaultKeymap } from '@codemirror/commands'
import { commentKeymap } from '@codemirror/comment'
import { foldKeymap } from '@codemirror/fold'
import { defaultHighlightStyle } from '@codemirror/highlight'
import { history, historyKeymap } from '@codemirror/history'
import { python } from '@codemirror/lang-python'
import { indentOnInput } from '@codemirror/language'
import { lintKeymap } from '@codemirror/lint'
import { bracketMatching } from '@codemirror/matchbrackets'
import { rectangularSelection } from '@codemirror/rectangular-selection'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { EditorState, Prec } from '@codemirror/state'
import {
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  highlightSpecialChars,
  keymap,
} from '@codemirror/view'
import {
  Card,
  CardHeader,
  Chip,
  Grow,
  IconButton,
  makeStyles,
} from '@material-ui/core'
import { ExpandMore } from '@material-ui/icons'
import CodeMirror from '@uiw/react-codemirror'
import clsx from 'clsx'
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { useDispatch, useSelector } from 'react-redux'
import {
  clearScrollback,
  clearSuggestion,
  doCommand,
  requestDiffEval,
  requestInspectEval,
  requestSuggestion,
  setPrompt,
  setSuggestion,
} from '../actions'
import { uid } from '../util'
import searchReducer, { initialSearch } from './searchReducer'
import { lexArgs, splitDiff } from './utils'
import valueReducer, { commandShortcuts, initialValue } from './valueReducer'

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

const baseExtensions = [
  highlightSpecialChars(),
  history(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  defaultHighlightStyle.fallback,
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  rectangularSelection(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  EditorView.lineWrapping,
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
  python(),
]

const useStyles = makeStyles(theme => ({
  card: {
    margin: '1em',
  },
  prompt: {
    '@global': {
      '.CodeMirror-cursors': {
        visibility: 'visible !important',
      },
      '.CodeMirror-cursor': {
        width: 'auto',
        border: 'none',
        outline: '1px solid rgba(0, 0, 0, .5)',
      },
      '.CodeMirror-focused .CodeMirror-cursor': {
        background: 'rgba(0, 0, 0, .75)',
        animation: 'blink 1.5s ease-in-out infinite',
        outline: 0,
      },
      '.CodeMirror-wrap pre.CodeMirror-line, .CodeMirror-wrap pre.CodeMirror-line-like':
        {
          wordBreak: 'break-word',
        },
    },
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(270deg)',
  },
  dialog: {
    fontSize: '.5em',
    color: theme.palette.text.secondary,
    display: 'flex',
    alignItems: 'center',
  },
  searchLabel: {
    padding: '4px 0',
  },
  notFound: {
    color: theme.palette.error.main,
  },
  '@global': {
    '.CodeMirror-hints': {
      maxHeight: '35em',
      zIndex: 10000,
    },
  },
  suggestion: {
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
  },
  completion: {
    fontSize: '1.25em',
  },
  base: {
    fontWeight: 'bold',
  },
  description: {
    color: theme.palette.text.secondary,
  },
}))

export default memo(function Prompt({ onScrollUp, onScrollDown }) {
  const classes = useStyles()
  const code = useRef()

  const history = useSelector(state => state.history)
  const scrollback = useSelector(state => state.scrollback)
  const suggestions = useSelector(state => state.suggestions)
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
        dispatch(requestInspectEval(key, selection))
      }
    }
    const handleGlobalFocus = ({ keyCode }) => {
      if (keyCode !== 13) {
        return
      }

      if (code.current) {
        code.current.view.focus()
      }
    }
    window.addEventListener('keydown', handleGlobalEval)
    window.addEventListener('keyup', handleGlobalFocus)
    return () => {
      window.removeEventListener('keydown', handleGlobalEval)
      window.removeEventListener('keyup', handleGlobalFocus)
    }
  }, [dispatch])

  const handleChange = useCallback((newValue, viewUpdate) => {
    if (viewUpdate.selectionSet) {
      valueDispatch({ type: 'new-value', value: newValue })
    }
  }, [])

  const handleCommand = useMemo(
    () =>
      Object.entries(commandShortcuts).reduce((functions, [key, command]) => {
        functions[key] = () =>
          valueDispatch({ type: 'toggle-command', command })
        return functions
      }, {}),
    [valueDispatch]
  )

  const handleEnter = useCallback(
    view => {
      if (!prompt.value) {
        return
      }
      const key = uid()
      switch (prompt.command) {
        case 'inspect':
          dispatch(
            requestInspectEval(key, prompt.value, prompt.command, activeFrame)
          )
          break
        case 'diff':
          dispatch(
            requestDiffEval(
              key,
              ...splitDiff(prompt.value),
              prompt.command,
              activeFrame
            )
          )
          break
        default:
          dispatch(setPrompt(key, prompt.value, prompt.command, activeFrame))
      }

      valueDispatch({ type: 'reset' })
    },
    [activeFrame, dispatch, prompt.command, prompt.value]
  )

  const handleUp = useCallback(() => {
    valueDispatch({ type: 'handle-up', history })
    return true
  }, [history])

  const handleDown = useCallback(() => {
    valueDispatch({ type: 'handle-down', history })
    return true
  }, [history])

  const handleEntered = useCallback(() => {
    if (code.current) {
      // code.current.refresh()
      code.current.view.focus()
    }
  }, [code])

  const handleCompletion = useCallback(
    view => {
      const cursor = view.state.doc.lineAt(view.state.selection.main.head)
      const token = codeMirror.getTokenAt(cursor)
      const from = {
        line: cursor.number - 1,
        ch: token.type && token.type !== 'operator' ? token.start : token.end,
      }
      const to = { line: cursor.line, ch: token.end }
      if (!prompt.value.includes(' ') && prompt.value.startsWith('?')) {
        dispatch(
          setSuggestion({
            prompt: prompt.value,
            from,
            to,
            suggestion: {
              from: { line: from.line, ch: 0 },
              to,
              list: Object.values(commandShortcuts).map(cmd => ({
                text: `?${cmd}`,
              })),
            },
          })
        )
        return
      }
      dispatch(requestSuggestion(prompt.value, from, to, cursor, activeFrame))
    },
    [activeFrame, dispatch, prompt.value]
  )

  const handleBackspace = useCallback(
    view => {
      if (view.state.selection.main.head === 0 && prompt.command) {
        valueDispatch({ type: 'remove-command' })
        return true
      }
    },
    [prompt]
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
      console.log(index, historySearched, newIndex)
      if (newIndex === -1) {
        searchDispatch({ type: 'not-found', value: newSearch })
        return
      }
      console.log(newIndex)
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

  const provideSuggestion = useCallback(
    () => ({
      from: suggestions.suggestion.from,
      to: suggestions.suggestion.to,
      list: suggestions.suggestion.list.map(
        ({ text, base, complete, description }) => ({
          text,
          render: elt => {
            elt.innerHTML = renderToStaticMarkup(
              <div className={classes.suggestion}>
                <span className={classes.completion}>
                  <span className={classes.base}>{base}</span>
                  {complete}
                </span>
                <span className={classes.description}>{description}</span>
              </div>
            )
          },
        })
      ),
    }),
    [suggestions, classes]
  )

  const removeSuggestion = useCallback(
    () => dispatch(clearSuggestion()),
    [dispatch]
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
          // { key: 'Ctrl-Space', run: handleCompletion, preventDefault: true },
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
          { key: 'Alt-i', run: handleCommand.i, preventDefault: true },
          { key: 'Alt-d', run: handleCommand.d, preventDefault: true },
        ])
      ),
      ...baseExtensions,
    ]
  }, [
    handleBackspace,
    handleClearScreen,
    handleCommand.d,
    handleCommand.i,
    handleDieIfEmpty,
    handleDown,
    handleEnter,
    handleInsertHistoryArgDown,
    handleInsertHistoryArgUp,
    handleRemoveAllOrCopy,
    handleSearch,
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

  return (
    <Grow
      in={grow}
      exit={false}
      mountOnEnter
      unmountOnExit
      onEntered={handleEntered}
    >
      <Card raised className={classes.card}>
        <CardHeader
          avatar={
            <>
              <IconButton
                className={clsx(classes.expand, {
                  [classes.expandOpen]: grow,
                })}
                onClick={handleEnter}
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
                className={classes.prompt}
                value={prompt.value}
                basicSetup={false}
                theme="light"
                onChange={handleChange}
                height="auto"
                extensions={extensions}
                // cursorBlinkRate={0}
                // viewportMargin={Infinity}
                width="100%"
              />
              {/* {suggestions && suggestions.prompt === prompt.value && (
                  <Hint
                    hint={provideSuggestion}
                    onEndCompletion={removeSuggestion}
                  />
                )}

                {search.highlight && <Highlight mode={search.highlight} />} */}
              {/* </Code> */}
              {search.value !== null && (
                <label
                  className={clsx(classes.dialog, {
                    [classes.notFound]: search.notFound,
                  })}
                >
                  <span className={classes.searchLabel}>
                    {search.insensitive && 'I-'}Search{' '}
                    {search.reverse ? 'backward' : 'forward'}:
                  </span>
                  <CodeMirror
                    className={classes.search}
                    value={search.value}
                    height="auto"
                    autoFocus
                    basicSetup={false}
                    extensions={searchExtensions}
                    width="100%"
                    onChange={handleIncrementalSearch}
                  />
                </label>
              )}
            </>
          }
          titleTypographyProps={{ variant: 'h5' }}
        />
      </Card>
    </Grow>
  )
})
