import { withStyles } from '@material-ui/core'
import React from 'react'
import red from '@material-ui/core/colors/red'

import Snippet from '../Code/Snippet'

@withStyles(() => ({
  err: {
    color: red[400],
  },
}))
export default class Err extends React.PureComponent {
  render() {
    const { classes, text } = this.props
    return <Snippet className={classes.err} value={text} mode={null} />
  }
}
