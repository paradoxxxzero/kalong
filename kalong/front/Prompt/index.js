import {
  Card,
  CardHeader,
  Chip,
  Grow,
  IconButton,
  makeStyles,
} from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import React, {
  useReducer,
  useEffect,
  useCallback,
  useRef,
  useState,
} from 'react'
import classnames from 'classnames'

import {
  clearScrollback,
  requestInspectEval,
  requestDiffEval,
  requestSuggestion,
  setPrompt,
  setSuggestion,
} from '../actions'
import { lexArgs, splitDiff } from './utils'
import { uid } from '../util'
import Code from '../Code'
import Highlight from '../Code/Highlight'
import Hint from '../Code/Hint'
import searchReducer, { initialSearch } from './searchReducer'
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
      pre: {
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
}))

export default function Prompt({ onScrollUp, onScrollDown }) {
  const classes = useStyles()
  const code = useRef()

  const history = useSelector(state => state.history)
  const scrollback = useSelector(state => state.scrollback)
  const suggestions = useSelector(state => state.suggestions)

  const dispatch = useDispatch()

  const [prompt, valueDispatch] = useReducer(valueReducer, initialValue)
  const [search, searchDispatch] = useReducer(searchReducer, initialSearch)
  useEffect(
    () => {
      const handleGlobalFocus = ({ target }) => {
        if (code.current) {
          if (!target.closest('[tabindex]')) {
            code.current.focus()
          }
        }
      }
      addEventListener('click', handleGlobalFocus)
      return () => removeEventListener('click', handleGlobalFocus)
    },
    [code]
  )
  useEffect(
    () => {
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
      addEventListener('keydown', handleGlobalEval)
      return () => removeEventListener('keydown', handleGlobalEval)
    },
    [dispatch]
  )

  const handleChange = useCallback(
    newValue => valueDispatch({ type: 'new-value', value: newValue }),
    []
  )

  const handleEnter = useCallback(
    () => {
      if (!prompt.value) {
        return
      }
      const key = uid()
      switch (prompt.command) {
        case 'inspect':
          dispatch(requestInspectEval(key, prompt.value, prompt.command))
          break
        case 'diff':
          dispatch(
            requestDiffEval(key, ...splitDiff(prompt.value), prompt.command)
          )
          break
        default:
          dispatch(setPrompt(key, prompt.value, prompt.command))
      }

      valueDispatch({ type: 'reset' })
    },
    [dispatch, prompt]
  )

  const handleUp = useCallback(
    () => {
      valueDispatch({ type: 'handle-up', history })
    },
    [history]
  )

  const handleDown = useCallback(
    () => {
      valueDispatch({ type: 'handle-down', history })
    },
    [history]
  )

  const handleEntered = useCallback(
    () => {
      if (code.current) {
        code.current.refresh()
        code.current.focus()
      }
    },
    [code]
  )

  const handleCompletion = useCallback(
    codeMirror => {
      const cursor = codeMirror.getCursor()
      const token = codeMirror.getTokenAt(cursor)
      const from = {
        line: cursor.line,
        ch: token.string === ' ' ? token.end : token.start,
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
      dispatch(requestSuggestion(prompt.value, from, to))
    },
    [dispatch, prompt]
  )

  const handleBackspace = useCallback(
    cm => {
      if (!prompt.value && prompt.command) {
        valueDispatch({ type: 'remove-command' })
      } else {
        cm.execCommand('delCharBefore')
      }
    },
    [prompt]
  )

  const handleRemoveCommand = useCallback(() => {
    valueDispatch({ type: 'remove-command' })
  }, [])

  const handleRemoveAllOrCopy = useCallback(cm => {
    if (cm.getSelection()) {
      // There's no codemirror command for this
      window.document.execCommand('copy')
    } else {
      valueDispatch({ type: 'reset' })
    }
  }, [])

  const handleDieIfEmpty = useCallback(
    () => {
      valueDispatch({ type: 'prepare-exit' })
      handleEnter()
    },
    [handleEnter]
  )

  const handleClearScreen = useCallback(
    () => {
      dispatch(clearScrollback())
    },
    [dispatch]
  )

  const handleSearch = options => () => {
    searchDispatch({
      type: 'search',
      reverse: options.reverse || false,
      insensitive: options.insensitive || false,
      reset: options.reset || false,
      history,
    })
    handleIncrementalSearch(search.value)
  }

  const handleSearchClose = useCallback(
    () => {
      searchDispatch({ type: 'reset' })
      if (code.current) {
        code.current.focus()
      }
    },
    [code]
  )

  const handleIncrementalSearch = useCallback(
    newSearch => {
      if (!newSearch) {
        searchDispatch({ type: 'empty' })
        return
      }
      const valueRE = new RegExp(
        newSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        `g${search.insensitive ? 'i' : ''}`
      )
      const baseIndex = search.reverse ? prompt.index + 1 : prompt.index - 1
      const historySearched = search.reverse
        ? history.slice(baseIndex)
        : [...history].sort(() => -1).slice(history.length - baseIndex - 1)
      const newIndex = historySearched.findIndex(p => p && p.match(valueRE))
      if (newIndex === -1) {
        searchDispatch({ type: 'not-found', value: newSearch })
        return
      }
      const finalIndex = search.reverse
        ? baseIndex + newIndex
        : baseIndex - newIndex
      searchDispatch({
        type: 'found',
        value: newSearch,
        highlight: getHighlighter(valueRE),
      })
      valueDispatch({
        type: 'jump',
        index: finalIndex,
        value: history[finalIndex],
      })
    },
    [history, search, prompt]
  )

  const handleTabOrComplete = useCallback(
    codeMirror => {
      const { line, ch } = codeMirror.getCursor()
      if (
        codeMirror
          .getLine(line)
          .slice(0, ch)
          .match(/^\s*$/)
      ) {
        codeMirror.execCommand('defaultTab')
      } else {
        handleCompletion(codeMirror)
      }
    },
    [handleCompletion]
  )

  const [historyInsert, setHistoryInsert] = useState(null)
  const handleInsertHistoryArg = useCallback(
    (codeMirror, way) => {
      const historyArgs = history.reduce(
        (args, expr) => [...args, ...lexArgs(expr)],
        []
      )
      const initialIndex = way === 'up' ? 0 : history.length - 1
      const incrementalIndex =
        historyInsert !== null &&
        (way === 'up' ? historyInsert + 1 : historyInsert - 1)
      const historyIndex =
        !codeMirror.getSelection() || historyInsert === null
          ? initialIndex
          : incrementalIndex
      const insert = historyArgs[historyIndex]

      codeMirror.setSelection(
        codeMirror.getCursor('from'),
        codeMirror.getCursor('to')
      )
      if (insert) {
        codeMirror.replaceSelection(insert, 'around')
        setHistoryInsert(historyIndex)
      } else {
        codeMirror.replaceSelection('', 'around')
      }
    },
    [history, historyInsert, setHistoryInsert]
  )

  const handleInsertHistoryArgUp = useCallback(
    codeMirror => {
      handleInsertHistoryArg(codeMirror, 'up')
    },
    [handleInsertHistoryArg]
  )

  const handleInsertHistoryArgDown = useCallback(
    codeMirror => {
      handleInsertHistoryArg(codeMirror, 'down')
    },
    [handleInsertHistoryArg]
  )

  const provideSuggestion = useCallback(() => suggestions.suggestion, [
    suggestions,
  ])

  const grow =
    scrollback.length === 0 || scrollback.slice(-1)[0].answer !== null

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
                className={classnames(classes.expand, {
                  [classes.expandOpen]: grow,
                })}
                onClick={handleEnter}
                disabled={!code.current || !code.current.getValue().length}
              >
                <ExpandMoreIcon />
              </IconButton>
              {prompt.command && (
                <Chip label={prompt.command} onDelete={handleRemoveCommand} />
              )}
            </>
          }
          title={
            <>
              <Code
                ref={code}
                className={classes.prompt}
                value={prompt.value}
                onChange={handleChange}
                height="auto"
                cursorBlinkRate={0}
                viewportMargin={Infinity}
                width="100%"
                lineWrapping
                extraKeys={{
                  Up: handleUp,
                  Down: handleDown,
                  Enter: handleEnter,
                  Backspace: handleBackspace,
                  'Ctrl-Space': handleCompletion,
                  'Ctrl-C': handleRemoveAllOrCopy,
                  'Ctrl-D': handleDieIfEmpty,
                  'Ctrl-L': handleClearScreen,
                  'Ctrl-R': handleSearch({
                    reverse: true,
                    reset: true,
                  }),
                  'Ctrl-S': handleSearch({
                    reset: true,
                  }),
                  'Shift-Ctrl-R': handleSearch({
                    reverse: true,
                    insensitive: true,
                    reset: true,
                  }),
                  'Shift-Ctrl-S': handleSearch({
                    insensitive: true,
                    reset: true,
                  }),
                  'Shift-PageUp': onScrollUp,
                  'Shift-PageDown': onScrollDown,
                  Tab: handleTabOrComplete,
                  'Alt-Up': handleInsertHistoryArgUp,
                  'Alt-Down': handleInsertHistoryArgDown,
                }}
              >
                {suggestions && suggestions.prompt === prompt.value && (
                  <Hint hint={provideSuggestion} />
                )}

                {search.highlight && <Highlight mode={search.highlight} />}
              </Code>
              {search.value !== null && (
                <label
                  className={classnames(classes.dialog, {
                    [classes.notFound]: search.notFound,
                  })}
                >
                  <span className={classes.searchLabel}>
                    {search.insensitive && 'I-'}Search{' '}
                    {search.reverse ? 'backward' : 'forward'}:
                  </span>
                  <Code
                    className={classes.search}
                    value={search.value}
                    height="auto"
                    autofocus
                    width="100%"
                    lineWrapping
                    onChange={handleIncrementalSearch}
                    extraKeys={{
                      Enter: handleSearchClose,
                      Esc: handleSearchClose,
                      'Ctrl-R': handleSearch({
                        reverse: true,
                      }),
                      'Ctrl-S': handleSearch({}),
                      'Shift-Ctrl-R': handleSearch({
                        reverse: true,
                        insensitive: true,
                      }),
                      'Shift-Ctrl-S': handleSearch({
                        insensitive: true,
                      }),
                    }}
                    onBlur={handleSearchClose}
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
}
