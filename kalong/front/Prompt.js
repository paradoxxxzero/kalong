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

import { requestInspectEval, setPrompt } from './actions'
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
  }),
  dispatch => ({
    addPrompt: (key, prompt) => dispatch(setPrompt(key, prompt)),
    inspectEval: (key, prompt) => dispatch(requestInspectEval(key, prompt)),
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
}))
export default class Prompt extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      index: -1,
      value: '',
      transientValue: '',
      command: null,
    }
    this.code = React.createRef()

    this.handleChange = this.handleChange.bind(this)
    this.handleEnter = this.handleEnter.bind(this)
    this.handleEntered = this.handleEntered.bind(this)
    this.handleUp = this.handleUp.bind(this)
    this.handleDown = this.handleDown.bind(this)
    this.handleBackspace = this.handleBackspace.bind(this)
    this.handleRemoveCommand = this.handleRemoveCommand.bind(this)
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

  render() {
    const { classes, scrollback } = this.props
    const { command, value } = this.state
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
                }}
              />
            }
            titleTypographyProps={{ variant: 'h5' }}
          />
        </Card>
      </Grow>
    )
  }
}
