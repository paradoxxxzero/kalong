import { Card, CardHeader, withStyles } from '@material-ui/core'
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
  }),
  dispatch => ({
    addPrompt: (key, prompt) => dispatch(setPrompt(key, prompt)),
  })
)
@withStyles(() => ({
  card: {
    margin: '1em',
  },
}))
export default class Prompt extends React.PureComponent {
  constructor(props) {
    super(props)
    this.handleEnter = this.handleEnter.bind(this)
  }

  handleEnter(codeMirror) {
    const { addPrompt } = this.props
    const value = codeMirror.getValue()
    if (!value) {
      return
    }
    addPrompt(uid(), value)
    codeMirror.setValue('')
    // codeMirror.display.wrapper.scrollIntoView()
  }

  render() {
    const { classes } = this.props
    return (
      <Card className={classes.card}>
        <CardHeader
          avatar={<ChevronRightIcon fontSize="large" />}
          title={
            <Code
              className={classes.prompt}
              height="auto"
              viewportMargin={Infinity}
              extraKeys={{ Enter: this.handleEnter }}
            />
          }
          titleTypographyProps={{ variant: 'h5' }}
        />
      </Card>
    )
  }
}
