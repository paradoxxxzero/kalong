import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import Frames from './Frames'
import { useColorScheme } from '@mui/material/styles'
import { IconButton, Tooltip } from '@mui/material'

import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import SettingsIcon from '@mui/icons-material/Settings'

import DensityLargeIcon from '@mui/icons-material/DensityLarge'
import DensityMediumIcon from '@mui/icons-material/DensityMedium'
import DensitySmallIcon from '@mui/icons-material/DensitySmall'
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify'
import { setInvert, setSpacing } from './actions'
import { useDispatch, useSelector } from 'react-redux'
const drawerWidth = 240

export default function SideDrawer({ rtl, open, mobile, onDrawerClose }) {
  const { mode, setMode, colorScheme } = useColorScheme()
  const dispatch = useDispatch()
  const spacing = useSelector(state => state.spacing)
  const invert = useSelector(state => state.invert)

  const SpacingIcon = [
    FormatAlignJustifyIcon,
    DensitySmallIcon,
    DensityMediumIcon,
    DensityLargeIcon,
  ][spacing]

  if (!mode) {
    return null
  }
  return (
    <Drawer
      sx={theme => ({
        width: {
          sm: drawerWidth,
          md: open ? drawerWidth : 0,
        },
        '& .MuiPaper-root': {
          width: {
            sm: drawerWidth,
            md: open ? drawerWidth : 0,
          },
        },
        flexShrink: {
          sm: 0,
          md: null,
        },
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration:
            theme.transitions.duration[
              open ? 'enteringScreen' : 'leavingScreen'
            ],
        }),
        overflow: open ? undefined : 'hidden',
      })}
      open={open}
      variant={mobile ? 'temporary' : 'persistent'}
      anchor={rtl ? 'right' : 'left'}
      onClose={onDrawerClose}
    >
      <Box
        sx={theme => ({
          ...theme.mixins.toolbar,
          display: 'flex',
        })}
      >
        <Box
          sx={{
            p: 1,
            display: 'flex',
            width: '100%',
            justifyContent: 'space-around',
            userSelect: 'none',
          }}
        >
          <Link
            href="http://github.com/paradoxxxzero/kalong/"
            underline="none"
            sx={{
              flex: 1,
              marginRight: 4,
              marginLeft: 4,
              h1: {
                transform: 'rotateY(180deg) rotateZ(-90deg)',
                transition: 'transform 0.4s ease-in-out 0.3s',
              },
              small: {
                transition: 'transform 0.4s ease-in-out',
                transform: 'rotateY(90deg)',
                transformOrigin: 'left',
              },
              ':hover h1': {
                transition: 'transform 0.4s ease-in-out 1s',
                transform: 'rotateY(0) rotateZ(0)',
              },
              ':hover small': {
                transition: 'transform 0.4s ease-in-out 1.25s',
                transform: 'rotateY(0) rotateZ(0)',
              },
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontFamily: '"Fira Code", monospace',
                fontSize: '4.25em',
                lineHeight: '0.7em',
                textAlign: 'center',
              }}
            >
              K
              <Typography
                component="small"
                sx={{
                  display: 'inline-block',
                  position: 'absolute',
                  bottom: '-.25em',
                  fontSize: '.3em',
                }}
              >
                along
              </Typography>
            </Typography>
          </Link>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <IconButton
              size="small"
              onClick={() => {
                if (invert) {
                  dispatch(setInvert(false))
                } else {
                  setMode(mode !== 'dark' ? 'dark' : 'light')
                  dispatch(setInvert(true))
                }
              }}
              onContextMenu={evt => {
                setMode('system')
                evt.preventDefault()
              }}
            >
              {colorScheme === 'dark' ? (
                <Tooltip title="Switch to Dark Mode. (Right-click to let the system choose)">
                  <DarkModeIcon />
                </Tooltip>
              ) : (
                <Tooltip title="Switch to Light Mode (Right-click to let the system choose)">
                  <LightModeIcon />
                </Tooltip>
              )}
              {mode === 'system' ? (
                <SettingsIcon
                  fontSize="small"
                  sx={{
                    position: 'absolute',
                    top: '1.1em',
                    left: '1em',
                    width: '0.6em',
                  }}
                />
              ) : invert ? (
                mode === 'light' ? (
                  <DarkModeIcon
                    fontSize="small"
                    sx={{
                      position: 'absolute',
                      top: '1.1em',
                      left: '1em',
                      width: '0.6em',
                    }}
                  />
                ) : (
                  <LightModeIcon
                    fontSize="small"
                    sx={{
                      position: 'absolute',
                      top: '1.1em',
                      left: '1em',
                      width: '0.6em',
                    }}
                  />
                )
              ) : null}
            </IconButton>
            <IconButton
              size="small"
              onClick={() => dispatch(setSpacing((spacing + 1) % 4))}
            >
              <SpacingIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
      <Divider />
      <Frames />
    </Drawer>
  )
}
