import { withStyles } from '@material-ui/core'
import React from 'react'

@withStyles(() => ({
  out: {},
}))
export default class Out extends React.PureComponent {
  render() {
    const { classes, text } = this.props
    return (
      <span className={classes.out} title="stdout">
        {text}
      </span>
    )
  }
}
