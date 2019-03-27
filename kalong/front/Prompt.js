import { Card, CardHeader, Grow, withStyles } from '@material-ui/core'
import { connect } from 'react-redux'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import React from 'react'

import { setPrompt } from './actions'
import { uid } from './util'
import Code from './Code'

@connect(
  state => ({
    activeFrame: state.activeFrame,
    frames: state.frames,
    history: state.history,
    scrollback: state.scrollback,
  }),
  dispatch => ({
    addPrompt: (key, prompt) => dispatch(setPrompt(key, prompt)),
  })
)
@withStyles(() => ({
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
    }
    this.code = React.createRef()

    this.handleChange = this.handleChange.bind(this)
    this.handleEnter = this.handleEnter.bind(this)
    this.handleEntered = this.handleEntered.bind(this)
    this.handleUp = this.handleUp.bind(this)
    this.handleDown = this.handleDown.bind(this)
  }

  handleChange(value) {
    this.setState({ index: -1, value, transientValue: value })
  }

  handleEnter(codeMirror) {
    const { addPrompt } = this.props
    const value = codeMirror.getValue()
    if (!value) {
      return
    }
    addPrompt(uid(), value)
    this.setState({
      index: -1,
      value: '',
      transientValue: '',
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

  render() {
    const { classes, scrollback } = this.props
    const { value } = this.state
    return (
      <Grow
        in={scrollback.length === 0 || scrollback.slice(-1)[0].answer !== null}
        exit={false}
        mountOnEnter
        unmountOnExit
        onEntered={this.handleEntered}
      >
        <Card raised className={classes.card}>
          <CardHeader
            avatar={<ChevronRightIcon fontSize="large" />}
            title={
              <Code
                ref={this.code}
                className={classes.prompt}
                value={value}
                onChange={this.handleChange}
                height="auto"
                cursorBlinkRate={0}
                viewportMargin={Infinity}
                extraKeys={{
                  Up: this.handleUp,
                  Down: this.handleDown,
                  Enter: this.handleEnter,
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
