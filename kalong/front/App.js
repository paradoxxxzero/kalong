import { makeStyles } from '@material-ui/core'
import { useSelector, useDispatch } from 'react-redux'
import { useTheme } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import React, { useState, useEffect, useCallback } from 'react'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import clsx from 'clsx'

import FiraCode from './font/FiraCode-Regular.otf'
import FiraCodeBold from './font/FiraCode-Bold.otf'
import GlobalIndicator from './GlobalIndicator'
import Main from './Main'
import SideDrawer from './SideDrawer'
import TopBar from './TopBar'
import { hello } from './actions'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    justifyContent: 'center',
    fontVariant: 'oldstyle-nums',
    transition: 'filter 500ms ease-in',
  },
  mute: {
    filter: 'grayscale(100%)',
  },
  content: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0, // Fix codemirror wrapping
  },
  terminal: {
    flex: 1,
  },
  source: {
    flex: 1,
  },
  indicator: {
    position: 'fixed',
    right: '1em',
    bottom: '1em',
  },
  '@global': {
    '@font-face': [
      {
        fontFamily: 'Fira Code',
        fontWeight: 'normal',
        fontStyle: 'normal',
        src: `url(${FiraCode}) format("opentype")`,
      },
      {
        fontFamily: 'Fira Code',
        fontWeight: 'bold',
        fontStyle: 'normal',
        src: `url(${FiraCodeBold}) format("opentype")`,
      },
    ],
  },
})

export default function App() {
  const classes = useStyles()
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('sm'))
  const dispatch = useDispatch()
  const running = useSelector(state => state.running)
  const frames = useSelector(state => state.frames)
  const [open, setOpen] = useState(!mobile)

  useEffect(() => {
    dispatch(hello())
  }, [dispatch])

  useEffect(
    () => {
      setOpen(!mobile && !!frames.length)
    },
    [mobile, frames] // only set if value has changed i.e. resize
  )
  const openDrawer = useCallback(() => setOpen(true), [])
  const closeDrawer = useCallback(() => setOpen(false), [])
  return (
    <div className={clsx(classes.root, { [classes.mute]: running })}>
      <CssBaseline />
      <TopBar
        mobile={mobile}
        open={open}
        rtl={theme.direction === 'rtl'}
        onDrawerOpen={openDrawer}
        onDrawerClose={closeDrawer}
      />
      <SideDrawer
        mobile={mobile}
        open={open}
        rtl={theme.direction === 'rtl'}
        onDrawerClose={closeDrawer}
      />
      <Main />
      <GlobalIndicator className={classes.indicator} />
    </div>
  )
}
