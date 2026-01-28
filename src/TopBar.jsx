import ChevronLeft from '@mui/icons-material/ChevronLeft'
import ChevronRight from '@mui/icons-material/ChevronRight'
import AppBar from '@mui/material/AppBar'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import React from 'react'
import TopActions from './TopActions'
import { useColorScheme } from '@mui/material/styles'

const drawerWidth = 240

export default function TopBar({
  rtl,
  open,
  mobile,
  onDrawerOpen,
  onDrawerClose,
}) {
  const { colorScheme } = useColorScheme()
  return (
    <AppBar
      sx={theme => ({
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
      <Toolbar
        sx={theme =>
          colorScheme === 'dark'
            ? {
                color: theme.vars.palette.primary.main,
              }
            : undefined
        }
      >
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
