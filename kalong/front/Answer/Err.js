import { withStyles } from '@material-ui/core'
import React from 'react'
import red from '@material-ui/core/colors/red'

@withStyles(() => ({
  err: {
    color: red[400],
  },
}))
export default class Err extends React.PureComponent {
  render() {
    const { classes, text } = this.props
    return (
      <span className={classes.err} title="stderr">
        {text}
      </span>
    )
  }
}
