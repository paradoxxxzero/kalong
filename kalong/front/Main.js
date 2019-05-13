import { makeStyles } from '@material-ui/core'
import React from 'react'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import Source from './Source'
import Splitter from './Splitter'
import Terminal from './Terminal'

const useStyles = makeStyles(theme => ({
  main: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0, // Fix codemirror wrapping
  },
  toolbar: {
    ...theme.mixins.toolbar,
  },
  splitter: {
    flex: 1,
  },
  terminal: {
    flex: 1,
  },
  source: {
    flex: 1,
  },
}))

export default function Main() {
  const vertical = useMediaQuery('(min-aspect-ratio: 1/1)')
  const classes = useStyles()
  return (
    <main className={classes.main}>
      <div className={classes.toolbar} />
      <Splitter className={classes.splitter} vertical={vertical}>
        <Source className={classes.source} />
        <Terminal className={classes.terminal} />
      </Splitter>
    </main>
  )
}
