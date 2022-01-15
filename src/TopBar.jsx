import { ThemeProvider, StyledEngineProvider, Tooltip } from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import AppBar from '@mui/material/AppBar'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import clsx from 'clsx'
import React from 'react'
import { useSelector } from 'react-redux'
import { muiThemes } from './ThemedApp'
import TopActions from './TopActions'

const drawerWidth = 240

const useStyles = makeStyles(theme => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 2,
    transition: `${theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    })},${theme.transitions.create(['background-color', 'color'], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.normal,
    })}`,
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: `${theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    })},${theme.transitions.create(['background-color', 'color'], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.normal,
    })}`,
    marginLeft: drawerWidth,
  },
  menuButton: {
    marginRight: 20,
  },
}))

export default function TopBar({
  rtl,
  open,
  mobile,
  onDrawerOpen,
  onDrawerClose,
}) {
  const classes = useStyles()
  return (
    <AppBar
      position="fixed"
      className={clsx(classes.appBar, {
        [classes.appBarShift]: open && !mobile,
      })}
    >
      <Toolbar>
        <Tooltip title={`${open ? 'Close' : 'Open'} the call stack`}>
          <IconButton
            color="inherit"
            onClick={open ? onDrawerClose : onDrawerOpen}
            className={classes.menuButton}
            size="large"
          >
            {!mobile && open ? (
              rtl ? (
                <ChevronRight />
              ) : (
                <ChevronLeft />
              )
            ) : rtl ? (
              <ChevronLeft />
            ) : (
              <ChevronRight />
            )}
          </IconButton>
        </Tooltip>
        <TopActions mobile={mobile} />
      </Toolbar>
    </AppBar>
  )
}
