import { Box, Link } from '@mui/material'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import React from 'react'
import Frames from './Frames'

const drawerWidth = 240

export default function SideDrawer({ rtl, open, mobile, onDrawerClose }) {
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
            alignItems: 'baseline',
            width: '100%',
            justifyContent: 'space-around',
            userSelect: 'none',
          }}
        >
          <Link
            href="http://github.com/paradoxxxzero/kalong/"
            underline="hover"
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: '2.25em',
                '&:hover span': {
                  display: 'inline-block',
                  '&.K': {
                    transform:
                      'rotate3d(0, 0, 1, -90deg) translate(-8.5px, 0px)',
                    textDecoration: 'none',
                  },
                  '&.o': {
                    transform: 'rotate3d(0, 1, 0, 180deg)',
                    textDecoration: 'underline',
                  },
                  transformOrigin: 'center',
                },
              }}
            >
              <Box
                component="span"
                className="K"
                sx={{
                  transform: 'rotate3d(0, 1, 0, 0deg)',
                  transition: 'transform 500ms',
                  marginLeft: '-1px',
                }}
              >
                K
              </Box>
              al
              <Box
                component="span"
                className="o"
                sx={{
                  transform: 'rotate3d(0, 1, 0, 0deg)',
                  transition: 'transform 500ms',
                  marginLeft: '-1px',
                }}
              >
                o
              </Box>
              ng
            </Typography>
          </Link>
          <Link
            href="http://github.com/paradoxxxzero/kalong/releases"
            underline="hover"
          >
            <Typography variant="subtitle1" sx={{ fontSize: '1.25em' }}>
              v0.4.0
            </Typography>
          </Link>
        </Box>
      </Box>
      <Divider />
      <Frames />
    </Drawer>
  )
}
