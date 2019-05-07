import {
  Card,
  CardHeader,
  Chip,
  Grow,
  IconButton,
  withStyles,
} from '@material-ui/core'
import { connect } from 'react-redux'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import React from 'react'
import classnames from 'classnames'

import {
  clearScrollback,
  requestInspectEval,
  requestSuggestion,
  setPrompt,
  setSuggestion,
} from './actions'
import { uid } from './util'
import Code from './Code'

const commandShortcuts = {
  i: 'inspect',
}

@connect(
  state => ({
    activeFrame: state.activeFrame,
    frames: state.frames,
    history: state.history,
    scrollback: state.scrollback,
    suggestions: state.suggestions,
  }),
  dispatch => ({
    addPrompt: (key, prompt) => dispatch(setPrompt(key, prompt)),
    inspectEval: (key, prompt) => dispatch(requestInspectEval(key, prompt)),
    complete: (prompt, from, to) =>
      dispatch(requestSuggestion(prompt, from, to)),
    setSuggestions: (prompt, from, to, suggestion) =>
      dispatch(setSuggestion({ prompt, from, to, suggestion })),
    clearScreen: () => dispatch(clearScrollback()),
  })
)
@withStyles(theme => ({
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
export default class Prompt extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      index: -1,
      value: '',
      transientValue: '',
      command: null,
      search: '',
      searchDirection: null,
      searchInsensitive: false,
      baseSearchIndex: 0,
      searchNotFound: false,
      searchHighlight: null,
    }
    this.code = React.createRef()

    this.handleChange = this.handleChange.bind(this)
    this.handleEnter = this.handleEnter.bind(this)
    this.handleEntered = this.handleEntered.bind(this)
    this.handleUp = this.handleUp.bind(this)
    this.handleDown = this.handleDown.bind(this)
    this.handleBackspace = this.handleBackspace.bind(this)
    this.handleCompletion = this.handleCompletion.bind(this)
    this.handleRemoveCommand = this.handleRemoveCommand.bind(this)
    this.provideSuggestion = this.provideSuggestion.bind(this)
    this.handleGlobalFocus = this.handleGlobalFocus.bind(this)
    this.handleRemoveAllOrCopy = this.handleRemoveAllOrCopy.bind(this)
    this.handleDieIfEmpty = this.handleDieIfEmpty.bind(this)
    this.handleClearScreen = this.handleClearScreen.bind(this)

    this.handleScrollUp = this.handleScrollUp.bind(this)
    this.handleScrollDown = this.handleScrollDown.bind(this)
    this.handleTabOrComplete = this.handleTabOrComplete.bind(this)
    this.handleInsertHistoryUp = this.handleInsertHistoryUp.bind(this)
    this.handleInsertHistoryDown = this.handleInsertHistoryDown.bind(this)

    this.handleIncrementalSearch = this.handleIncrementalSearch.bind(this)
    this.handleSearchClose = this.handleSearchClose.bind(this)

    this.handleReverseSearch = this.handleSearch({
      reverse: true,
      insensitive: false,
      reset: true,
    }).bind(this)
    this.handleForwardSearch = this.handleSearch({
      reverse: false,
      insensitive: false,
      reset: true,
    }).bind(this)
    this.handleInsensitiveReverseSearch = this.handleSearch({
      reverse: true,
      insensitive: true,
      reset: true,
    }).bind(this)
    this.handleInsensitiveForwardSearch = this.handleSearch({
      reverse: false,
      insensitive: true,
      reset: true,
    }).bind(this)
    this.handleIncrementalReverseSearch = this.handleSearch({
      reverse: true,
      insensitive: false,
      reset: false,
    }).bind(this)
    this.handleIncrementalForwardSearch = this.handleSearch({
      reverse: false,
      insensitive: false,
      reset: false,
    }).bind(this)
    this.handleIncrementalInsensitiveReverseSearch = this.handleSearch({
      reverse: true,
      insensitive: true,
      reset: false,
    }).bind(this)
    this.handleIncrementalInsensitiveForwardSearch = this.handleSearch({
      reverse: false,
      insensitive: true,
      reset: false,
    }).bind(this)
  }

  componentDidMount() {
    addEventListener('click', this.handleGlobalFocus)
  }

  componentWillUnmount() {
    removeEventListener('click', this.handleGlobalFocus)
  }

  handleGlobalFocus({ target }) {
    if (this.code.current) {
      if (!target.closest('[tabindex]')) {
        this.code.current.codeMirror.focus()
      }
    }
  }

  handleChange(value) {
    const commandMatch = value.match(/^\?(\S+)\s(.*)/)
    if (commandMatch) {
      const fullCommand = commandShortcuts[commandMatch[1]] || commandMatch[1]
      const command = Object.values(commandShortcuts).includes(fullCommand)
        ? fullCommand
        : null
      if (command) {
        this.setState({
          index: -1,
          value: commandMatch[2],
          transientValue: commandMatch[2],
          command,
        })
        return
      }
    }
    this.setState({ index: -1, value, transientValue: value })
  }

  handleEnter() {
    const { addPrompt, inspectEval } = this.props
    const { command, value } = this.state
    if (!value) {
      return
    }
    const key = uid()
    switch (command) {
      case 'inspect':
        inspectEval(key, value)
        break
      default:
        addPrompt(key, value)
    }
    this.setState({
      index: -1,
      value: '',
      transientValue: '',
      command: null,
    })
  }

  handleUp() {
    const { history } = this.props
    this.setState(({ index }) => ({
      index: Math.min(index + 1, history.length - 1),
      value: history[Math.min(index + 1, history.length - 1)] || '',
    }))
  }

  handleDown() {
    const { history } = this.props
    this.setState(({ index, transientValue }) => ({
      index: Math.max(index - 1, -1),
      value: history[Math.max(index - 1, -1)] || transientValue,
    }))
  }

  handleEntered() {
    this.code.current.codeMirror.refresh()
    this.code.current.codeMirror.focus()
  }

  handleCompletion(codeMirror) {
    const { complete, setSuggestions } = this.props
    const { value } = this.state
    const cursor = codeMirror.getCursor()
    const token = codeMirror.getTokenAt(cursor)
    const from = {
      line: cursor.line,
      ch: token.string === ' ' ? token.end : token.start,
    }
    const to = { line: cursor.line, ch: token.end }
    if (!value.includes(' ') && value.startsWith('?')) {
      setSuggestions(value, from, to, {
        from: { line: from.line, ch: 0 },
        to,
        list: Object.values(commandShortcuts).map(command => ({
          text: `?${command}`,
        })),
      })
      return
    }
    complete(value, from, to)
  }

  handleBackspace(cm) {
    const { value, command } = this.state
    if (!value && command) {
      this.handleRemoveCommand()
    } else {
      cm.execCommand('delCharBefore')
    }
  }

  handleRemoveCommand() {
    this.setState({ command: null })
  }

  handleRemoveAllOrCopy(cm) {
    if (cm.getSelection()) {
      // There's no codemirror command for this
      window.document.execCommand('copy')
    } else {
      this.setState({ index: -1, value: '', transientValue: '' })
    }
  }

  handleDieIfEmpty() {
    this.setState({ value: 'import sys; sys.exit(1)' })
    this.handleEnter()
  }

  handleClearScreen() {
    const { clearScreen } = this.props
    clearScreen()
  }

  handleSearch({ reverse, insensitive, reset }) {
    return () => {
      const { history } = this.props
      const { index, baseSearchIndex } = this.state
      this.setState(
        {
          searchDirection: reverse ? 'reversed' : 'normal',
          searchInsensitive: insensitive,
          baseSearchIndex: reset
            ? reverse
              ? index === -1
                ? 0
                : index
              : index === -1
              ? history.length - 1
              : index
            : baseSearchIndex,
        },
        reset
          ? void 0
          : () =>
              this.handleIncrementalSearch(this.state.search, {
                baseIndex: reverse ? index + 1 : index - 1,
              })
      )
    }
  }

  handleSearchClose() {
    this.setState({
      search: '',
      searchInsensitive: false,
      searchDirection: null,
      searchNotFound: false,
      searchHighlight: null,
    })
    if (this.code.current) {
      this.code.current.codeMirror.focus()
    }
  }

  handleIncrementalSearch(value, { baseIndex }) {
    if (!value) {
      this.setState({
        searchNotFound: false,
        searchHighlight: null,
      })
      return
    }
    const { history } = this.props
    const { baseSearchIndex, searchInsensitive, searchDirection } = this.state
    const index = baseIndex === void 0 ? baseSearchIndex : baseIndex
    const valueRE = new RegExp(
      value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      `g${searchInsensitive ? 'i' : ''}`
    )
    const historySearched =
      searchDirection === 'reversed'
        ? history.slice(index)
        : [...history].sort(() => -1).slice(history.length - index - 1)
    const newIndex = historySearched.findIndex(prompt => prompt.match(valueRE))
    if (newIndex === -1) {
      this.setState({
        search: value,
        searchNotFound: true,
        searchHighlight: null,
      })
    } else {
      const finalIndex =
        searchDirection === 'reversed' ? index + newIndex : index - newIndex
      this.setState({
        search: value,
        index: finalIndex,
        value: history[finalIndex],
        searchNotFound: false,
        searchHighlight: {
          token: stream => {
            valueRE.lastIndex = stream.pos
            const match = valueRE.exec(stream.string)
            if (match && match.index === stream.pos) {
              stream.pos += match[0].length || 1
              return 'searching'
            } else if (match) {
              stream.pos = match.index
            } else {
              stream.skipToEnd()
            }
          },
        },
      })
    }
  }

  handleScrollUp() {
    const { onScrollUp } = this.props
    onScrollUp()
  }

  handleScrollDown() {
    const { onScrollDown } = this.props
    onScrollDown()
  }

  handleTabOrComplete() {}

  handleInsertHistoryUp() {}

  handleInsertHistoryDown() {}

  provideSuggestion() {
    const {
      suggestions: { suggestion },
    } = this.props
    return suggestion
  }

  render() {
    const { classes, suggestions, scrollback } = this.props
    const {
      command,
      value,
      search,
      searchDirection,
      searchInsensitive,
      searchNotFound,
      searchHighlight,
    } = this.state
    const grow =
      scrollback.length === 0 || scrollback.slice(-1)[0].answer !== null
    return (
      <Grow
        in={grow}
        exit={false}
        mountOnEnter
        unmountOnExit
        onEntered={this.handleEntered}
      >
        <Card raised className={classes.card}>
          <CardHeader
            avatar={
              <>
                <IconButton
                  className={classnames(classes.expand, {
                    [classes.expandOpen]: grow,
                  })}
                  onClick={this.handleEnter}
                  disabled={
                    !this.code.current ||
                    !this.code.current.codeMirror.getValue().length
                  }
                >
                  <ExpandMoreIcon />
                </IconButton>
                {command && (
                  <Chip label={command} onDelete={this.handleRemoveCommand} />
                )}
              </>
            }
            title={
              <>
                <Code
                  ref={this.code}
                  className={classes.prompt}
                  value={value}
                  onChange={this.handleChange}
                  height="auto"
                  cursorBlinkRate={0}
                  viewportMargin={Infinity}
                  width="100%"
                  lineWrapping
                  extraKeys={{
                    Up: this.handleUp,
                    Down: this.handleDown,
                    Enter: this.handleEnter,
                    Backspace: this.handleBackspace,
                    'Ctrl-Space': this.handleCompletion,
                    'Ctrl-C': this.handleRemoveAllOrCopy,
                    'Ctrl-D': this.handleDieIfEmpty,
                    'Ctrl-L': this.handleClearScreen,
                    'Ctrl-R': this.handleReverseSearch,
                    'Ctrl-S': this.handleForwardSearch,
                    'Shift-Ctrl-R': this.handleInsensitiveReverseSearch,
                    'Shift-Ctrl-S': this.handleInsensitiveForwardSearch,
                    'Shift-PageUp': this.handleScrollUp,
                    'Shift-PageDown': this.handleScrollDown,
                    Tab: this.handleTabOrComplete,
                    'Alt-Up': this.handleInsertHistoryUp,
                    'Alt-Down': this.handleInsertHistoryDown,
                  }}
                >
                  {suggestions && suggestions.prompt === value && (
                    <Code.Hint hint={this.provideSuggestion} />
                  )}

                  {searchHighlight && <Code.Highlight mode={searchHighlight} />}
                </Code>
                {searchDirection && (
                  <label
                    className={classnames(classes.dialog, {
                      [classes.searchNotFound]: searchNotFound,
                    })}
                  >
                    <span className={classes.searchLabel}>
                      {searchInsensitive && 'I-'}Search{' '}
                      {searchDirection === 'reversed' ? 'backward' : 'forward'}:
                    </span>
                    <Code
                      className={classes.search}
                      value={search}
                      height="auto"
                      autofocus
                      width="100%"
                      lineWrapping
                      onChange={this.handleIncrementalSearch}
                      extraKeys={{
                        Enter: this.handleSearchClose,
                        Esc: this.handleSearchClose,
                        'Ctrl-R': this.handleIncrementalReverseSearch,
                        'Ctrl-S': this.handleIncrementalForwardSearch,
                        'Shift-Ctrl-R': this
                          .handleIncrementalInsensitiveReverseSearch,
                        'Shift-Ctrl-S': this
                          .handleIncrementalInsensitiveForwardSearch,
                      }}
                      onBlur={this.handleSearchClose}
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
}
