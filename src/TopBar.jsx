import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import { Tooltip } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import React from 'react'
import TopActions from './TopActions'

const drawerWidth = 240

export default function TopBar({
  rtl,
  open,
  mobile,
  onDrawerOpen,
  onDrawerClose,
}) {
  return (
    <AppBar
      sx={theme => ({
        zIndex: theme.zIndex.drawer + 2,
        transition: `${theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration:
            theme.transitions.duration[
              open && !mobile ? 'enteringScreen' : 'leavingScreen'
            ],
        })},${theme.transitions.create(['background-color', 'color'], {
          easing: theme.transitions.easing.easeInOut,
          duration: theme.transitions.duration.normal,
        })}`,
        width: open && !mobile ? `calc(100% - ${drawerWidth}px)` : undefined,
        marginLeft: open && !mobile ? drawerWidth : undefined,
      })}
      position="fixed"
    >
      <Toolbar>
        <Tooltip title={`${open ? 'Close' : 'Open'} the call stack`}>
          <IconButton
            color="inherit"
            onClick={open ? onDrawerClose : onDrawerOpen}
            sx={{ mr: 2.5 }}
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
