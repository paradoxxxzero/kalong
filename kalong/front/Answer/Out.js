import { withStyles } from '@material-ui/core'
import React from 'react'

import Snippet from '../Code/Snippet'

@withStyles(() => ({
  out: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    overflowWrap: 'break-word',
  },
}))
export default class Out extends React.PureComponent {
  render() {
    const { classes, text } = this.props
    return <Snippet className={classes.out} value={text} mode={null} />
  }
}
