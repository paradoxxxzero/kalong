import { makeStyles } from '@material-ui/core'
import React from 'react'

import Snippet from '../Snippet'

const useStyles = makeStyles(() => ({
  out: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    overflowWrap: 'break-word',
  },
}))

export default function Out({ text }) {
  const classes = useStyles()
  return <Snippet className={classes.out} value={text} mode="text" />
}
