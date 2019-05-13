import { makeStyles } from '@material-ui/core'
import { useTheme } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import React, { useState, useEffect } from 'react'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import Main from './Main'
import SideDrawer from './SideDrawer'
import TopBar from './TopBar'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    justifyContent: 'center',
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
})

export default function App() {
  const classes = useStyles()
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [open, setOpen] = useState(!mobile)
  useEffect(
    () => {
      setOpen(!mobile)
    },
    [mobile] // only set if value has changed i.e. resize
  )
  return (
    <div className={classes.root}>
      <CssBaseline />
      <TopBar
        mobile={mobile}
        open={open}
        rtl={theme.direction === 'rtl'}
        onDrawerOpen={() => setOpen(true)}
        onDrawerClose={() => setOpen(false)}
      />
      <SideDrawer
        mobile={mobile}
        open={open}
        rtl={theme.direction === 'rtl'}
        onDrawerClose={() => setOpen(false)}
      />
      <Main />
    </div>
  )
}
