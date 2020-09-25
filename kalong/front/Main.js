import { makeStyles } from '@material-ui/core'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import React from 'react'
import { useSelector } from 'react-redux'
import Source from './Source'
import Splitter from './Splitter'
import Terminal from './Terminal'

const useStyles = makeStyles(theme => ({
  main: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    zIndex: theme.zIndex.drawer + 1,
    minWidth: 0, // Fix codemirror wrapping
  },
  toolbar: {
    ...theme.mixins.toolbar,
  },
  splitter: {
    flex: 1,
    minHeight: 0,
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
  const frames = useSelector(state => state.frames)
  const activeFrame = useSelector(state => state.activeFrame)
  const currentFile = frames.find(({ key }) => key === activeFrame)

  return (
    <main className={classes.main}>
      <div className={classes.toolbar} />
      <Splitter className={classes.splitter} vertical={vertical}>
        {currentFile && (
          <Source className={classes.source} currentFile={currentFile} />
        )}
        <Terminal className={classes.terminal} />
      </Splitter>
    </main>
  )
}
