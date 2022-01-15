import { makeStyles } from '@material-ui/core'
import React from 'react'
import red from '@material-ui/core/colors/red'

import Snippet from '../Snippet'

const useStyles = makeStyles(() => ({
  err: {
    color: red[400],
  },
}))

export default function Err({ text }) {
  const classes = useStyles()
  return <Snippet className={classes.err} value={text} mode="text" />
}
