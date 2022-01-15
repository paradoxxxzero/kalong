import makeStyles from '@mui/styles/makeStyles'
import React from 'react'

import Snippet from '../Snippet'

const useStyles = makeStyles(() => ({
  diff: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    overflowWrap: 'break-word',
  },
}))

export default function Diff({ diff }) {
  const classes = useStyles()
  return <Snippet className={classes.diff} value={diff} mode="diff" />
}
