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
      '.CodeMirror.dialog-opened .CodeMirror-code': {
        marginBottom: '20px',
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
    lineHeight: 0.7,
  },
  dialogTitle: { fontSize: '0.7em', color: theme.palette.text.secondary },
  dialogInput: {},
  notFound: {
    '@global': {
      '.CodeMirror-dialog': {
        color: theme.palette.error.main,
      },
    },
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
      search: null,
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
    this.handleReverseSearch = this.handleReverseSearch.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.handleScrollUp = this.handleScrollUp.bind(this)
    this.handleScrollDown = this.handleScrollDown.bind(this)
    this.handleTabOrComplete = this.handleTabOrComplete.bind(this)
    this.handleInsertHistoryUp = this.handleInsertHistoryUp.bind(this)
    this.handleInsertHistoryDown = this.handleInsertHistoryDown.bind(this)

    this.handleIncrementalSearch = this.handleIncrementalSearch.bind(this)
    this.handleSearchClose = this.handleSearchClose.bind(this)
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

  handleReverseSearch() {
    const { index } = this.state
    this.setState({
      search: 'reversed',
      baseSearchIndex: index === -1 ? 0 : index,
    })
  }

  handleSearch() {
    const { history } = this.props
    const { index } = this.state
    this.setState({
      search: 'normal',
      baseSearchIndex: index === -1 ? history.length - 1 : index,
    })
  }

  handleSearchClose() {
    this.setState({
      search: null,
      searchNotFound: false,
      searchHighlight: null,
    })
  }

  handleIncrementalSearch(e, value) {
    if (!value) {
      this.setState({
        searchNotFound: false,
        searchHighlight: null,
      })
      return
    }
    const { history } = this.props
    const { baseSearchIndex, search } = this.state
    const valueRE = new RegExp(
      value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      'gi'
    )
    const historySearched =
      search === 'reversed'
        ? history.slice(baseSearchIndex)
        : [...history]
            .sort(() => -1)
            .slice(history.length - baseSearchIndex - 1)
    const newIndex = historySearched.findIndex(prompt => prompt.match(valueRE))
    if (newIndex === -1) {
      this.setState({ searchNotFound: true, searchHighlight: null })
    } else {
      const finalIndex =
        search === 'reversed'
          ? baseSearchIndex + newIndex
          : baseSearchIndex - newIndex
      this.setState({
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
              <Code
                ref={this.code}
                className={classnames(classes.prompt, {
                  [classes.notFound]: searchNotFound,
                })}
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
                  'Ctrl-S': this.handleSearch,
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
                {search && (
                  <Code.Dialog
                    template={`
                      <div class="${classes.dialog}">
                        <span class="${classes.dialogTitle}">Search:</span>
                        <input
                          type="text"
                          class="${classes.dialogInput}"
                        />
                      </div>
                    `}
                    bottom
                    onInput={this.handleIncrementalSearch}
                    onClose={this.handleSearchClose}
                  />
                )}
                {searchHighlight && <Code.Highlight mode={searchHighlight} />}
              </Code>
            }
            titleTypographyProps={{ variant: 'h5' }}
          />
        </Card>
      </Grow>
    )
  }
}
