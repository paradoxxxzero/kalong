import makeStyles from '@mui/styles/makeStyles'
import React from 'react'
import Snippet from '../Snippet'

import { red } from '@mui/material/colors'

const useStyles = makeStyles(() => ({
  err: {
    color: red[400],
  },
}))

export default function Err({ text }) {
  const classes = useStyles()
  return <Snippet className={classes.err} value={text} mode="text" />
}
