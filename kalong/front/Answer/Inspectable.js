import { Button, withStyles } from '@material-ui/core'
import { connect } from 'react-redux'
import React from 'react'

import { requestInspect } from '../actions'
import { uid } from '../util'

@withStyles(() => ({
  button: {
    minWidth: 'auto',
    textTransform: 'none',
    padding: 0,
  },
}))
@connect(
  () => ({}),
  dispatch => ({
    inspect: (key, id) => dispatch(requestInspect(key, id)),
  })
)
export default class Inspectable extends React.PureComponent {
  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    const { id, inspect } = this.props
    inspect(uid(), id)
  }

  render() {
    const { classes, children } = this.props
    return (
      <Button onClick={this.handleClick} className={classes.button}>
        {children}
      </Button>
    )
  }
}