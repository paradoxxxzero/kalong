import { Tooltip, makeStyles, Menu } from '@material-ui/core'
import AppBar from '@material-ui/core/AppBar'
import IconButton from '@material-ui/core/IconButton'
import React from 'react'
import Toolbar from '@material-ui/core/Toolbar'
import classnames from 'classnames'
import { ChevronLeft, ChevronRight } from '@material-ui/icons'

import TopActions from './TopActions'

const drawerWidth = 240

const useStyles = makeStyles(theme => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
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
      easing: theme.transitions.easing.easeOut,
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
      className={classnames(classes.appBar, {
        [classes.appBarShift]: open && !mobile,
      })}
    >
      <Toolbar>
        <Tooltip title={`${open ? 'Close' : 'Open'} the call stack`}>
          <IconButton
            color="inherit"
            onClick={open ? onDrawerClose : onDrawerOpen}
            className={classes.menuButton}
          >
            {!mobile && open ? (
              rtl ? (
                <ChevronRight />
              ) : (
                <ChevronLeft />
              )
            ) : (
              <Menu />
            )}
          </IconButton>
        </Tooltip>
        <TopActions mobile={mobile} />
      </Toolbar>
    </AppBar>
  )
}
