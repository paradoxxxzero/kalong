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
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'

import DensityLargeIcon from '@mui/icons-material/DensityLarge'
import DensityMediumIcon from '@mui/icons-material/DensityMedium'
import DensitySmallIcon from '@mui/icons-material/DensitySmall'
import { setSpacing } from './actions'
import { useDispatch, useSelector } from 'react-redux'
const drawerWidth = 240

export default function SideDrawer({ rtl, open, mobile, onDrawerClose }) {
  const { mode, setMode } = useColorScheme()
  const dispatch = useDispatch()
  const spacing = useSelector(state => state.spacing)

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
            sx={{ flex: 1 }}
          >
            <Typography
              variant="h1"
              sx={{
                fontFamily: '"Fira Code", monospace',
                fontSize: '5em',
                lineHeight: '0.7em',
                textAlign: 'center',
                transform: 'rotate(-90deg)',
              }}
            >
              K
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
              onClick={() => setMode(mode !== 'dark' ? 'dark' : 'light')}
              onContextMenu={evt => {
                setMode('system')
                evt.preventDefault()
              }}
            >
              {mode === 'system' ? (
                <DarkModeIcon />
              ) : mode === 'light' ? (
                <Tooltip title="Switch to Dark Mode. (Right-click to let the system choose)">
                  <DarkModeIcon />
                </Tooltip>
              ) : (
                <Tooltip title="Switch to Light Mode (Right-click to let the system choose)">
                  <LightModeIcon />
                </Tooltip>
              )}
              {mode !== 'system' && (
                <MoreHorizIcon
                  fontSize="small"
                  sx={{
                    position: 'absolute',
                    top: '1.1em',
                    left: '1em',
                    width: '0.6em',
                  }}
                />
              )}
            </IconButton>
            <IconButton
              size="small"
              onClick={() => {
                const newspacing =
                  spacing === 'comfortable'
                    ? 'compact'
                    : spacing === 'compact'
                      ? 'spacious'
                      : 'comfortable'

                dispatch(setSpacing(newspacing))
              }}
            >
              {spacing === 'comfortable' ? (
                <DensityLargeIcon />
              ) : spacing === 'compact' ? (
                <DensityMediumIcon />
              ) : (
                <DensitySmallIcon />
              )}
            </IconButton>
          </Box>
        </Box>
      </Box>
      <Divider />
      <Frames />
    </Drawer>
  )
}
