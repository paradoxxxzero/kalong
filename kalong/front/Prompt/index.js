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
import React, { useReducer, useEffect, useCallback, useRef } from 'react'
import classnames from 'classnames'

import {
  clearScrollback,
  requestInspectEval,
  requestSuggestion,
  setPrompt,
  setSuggestion,
} from '../actions'
import { uid } from '../util'
import Code from '../Code'
import searchReducer from './searchReducer'
import valueReducer from './valueReducer'

const commandShortcuts = {
  i: 'inspect',
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
  searchNotFound: {
    color: theme.palette.error.main,
  },
}))

export default function Prompt({ onScrollUp, onScrollDown }) {
  const code = useRef()

  const [{ index, value, command }, valueDispatch] = useReducer(valueReducer, {
    index: -1,
    value: '',
    transientValue: '',
    command: null,
  })

  const [
    { search, reverse, insensitive, searchNotFound, searchHighlight },
    searchDispatch,
  ] = useReducer(searchReducer, {
    search: '',
    reverse: null,
    insensitive: false,
    searchNotFound: false,
    searchHighlight: null,
  })

  const history = useSelector(state => state.history)
  const scrollback = useSelector(state => state.scrollback)
  const suggestions = useSelector(state => state.suggestions)

  const classes = useStyles()
  const dispatch = useDispatch()

  const handleGlobalFocus = useCallback(
    ({ target }) => {
      if (code.current) {
        if (!target.closest('[tabindex]')) {
          code.current.codeMirror.focus()
        }
      }
    },
    [code]
  )

  useEffect(() => {
    addEventListener('click', handleGlobalFocus)
    return () => removeEventListener('click', handleGlobalFocus)
  })

  const handleChange = useCallback(newValue => {
    const commandMatch = newValue.match(/^\?(\S+)\s(.*)/)
    if (commandMatch) {
      const [, cmd, expr] = commandMatch
      const fullCommand = commandShortcuts[cmd] || cmd
      const newCommand = Object.values(commandShortcuts).includes(fullCommand)
        ? fullCommand
        : null
      if (newCommand) {
        valueDispatch({
          type: 'new-command',
          value: expr,
          command: newCommand,
        })
        return
      }
    }
    valueDispatch({ type: 'new-value', value: newValue })
  }, [])

  const handleEnter = useCallback(
    () => {
      if (!value) {
        return
      }
      const key = uid()
      switch (command) {
        case 'inspect':
          dispatch(requestInspectEval(key, value))
          break
        default:
          dispatch(setPrompt(key, value))
      }

      valueDispatch({ type: 'reset' })
    },
    [dispatch, command, value]
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
      code.current.codeMirror.refresh()
      code.current.codeMirror.focus()
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
      if (!value.includes(' ') && value.startsWith('?')) {
        dispatch(
          setSuggestion({
            prompt: value,
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
      dispatch(requestSuggestion(value, from, to))
    },
    [dispatch, value]
  )

  const handleBackspace = useCallback(
    cm => {
      if (!value && command) {
        valueDispatch({ type: 'remove-command' })
      } else {
        cm.execCommand('delCharBefore')
      }
    },
    [value, command]
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
    handleIncrementalSearch(search)
  }

  const handleSearchClose = useCallback(
    () => {
      searchDispatch({ type: 'reset' })
      if (code.current) {
        code.current.codeMirror.focus()
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
        `g${insensitive ? 'i' : ''}`
      )
      const baseIndex = reverse ? index + 1 : index - 1
      const historySearched = reverse
        ? history.slice(baseIndex)
        : [...history].sort(() => -1).slice(history.length - baseIndex - 1)
      const newIndex = historySearched.findIndex(prompt =>
        prompt.match(valueRE)
      )
      if (newIndex === -1) {
        searchDispatch({ type: 'not-found', search: newSearch })
        return
      }
      const finalIndex = reverse ? baseIndex + newIndex : baseIndex - newIndex
      searchDispatch({
        type: 'found',
        search: newSearch,
        highlight: getHighlighter(valueRE),
      })
      valueDispatch({
        type: 'jump',
        index: finalIndex,
        value: history[finalIndex],
      })
    },
    [history, reverse, insensitive, index]
  )

  const handleTabOrComplete = () => {}

  const handleInsertHistoryUp = () => {}

  const handleInsertHistoryDown = () => {}

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
                disabled={
                  !code.current || !code.current.codeMirror.getValue().length
                }
              >
                <ExpandMoreIcon />
              </IconButton>
              {command && (
                <Chip label={command} onDelete={handleRemoveCommand} />
              )}
            </>
          }
          title={
            <>
              <Code
                ref={code}
                className={classes.prompt}
                value={value}
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
                  'Alt-Up': handleInsertHistoryUp,
                  'Alt-Down': handleInsertHistoryDown,
                }}
              >
                {suggestions && suggestions.prompt === value && (
                  <Code.Hint hint={provideSuggestion} />
                )}

                {searchHighlight && <Code.Highlight mode={searchHighlight} />}
              </Code>
              {reverse !== null && (
                <label
                  className={classnames(classes.dialog, {
                    [classes.searchNotFound]: searchNotFound,
                  })}
                >
                  <span className={classes.searchLabel}>
                    {insensitive && 'I-'}Search{' '}
                    {reverse ? 'backward' : 'forward'}:
                  </span>
                  <Code
                    className={classes.search}
                    value={search}
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
