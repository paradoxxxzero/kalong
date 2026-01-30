import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import GlobalStyles from '@mui/material/GlobalStyles'
import { useColorScheme, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { hello } from './actions'
import FiraCodeBold from './font/FiraCode-Bold.otf'
import FiraCode from './font/FiraCode-Regular.otf'
import GlobalIndicator from './GlobalIndicator'
import Main from './Main'
import SideDrawer from './SideDrawer'
import TopBar from './TopBar'

export default function App() {
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('md'))
  const dispatch = useDispatch()
  const running = useSelector(state => state.running)
  const activeFrame = useSelector(state => state.activeFrame)
  const [open, setOpen] = useState(!mobile)
  const [prevMobile, setPrevMobile] = useState(mobile)
  const [prevActiveFrame, setPrevActiveFrame] = useState(activeFrame)
  const { colorScheme } = useColorScheme()
  if (prevMobile !== mobile) {
    setPrevMobile(mobile)
    setOpen(!mobile)
  }
  if (prevActiveFrame !== activeFrame) {
    setPrevActiveFrame(activeFrame)
    if (mobile) {
      setOpen(false)
    }
  }

  useEffect(() => {
    dispatch(hello())
  }, [dispatch])

  const openDrawer = useCallback(() => setOpen(true), [])
  const closeDrawer = useCallback(() => setOpen(false), [])
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        justifyContent: 'center',
        fontVariant: 'oldstyle-nums',
        transition: 'filter 2s ease-in',
        filter: running ? 'grayscale(100%)' : undefined,
      }}
    >
      <GlobalStyles
        styles={{
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
          ':root': {
            colorScheme: `${colorScheme} !important`,
          },
        }}
      />
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
      <GlobalIndicator
        sx={{
          position: 'fixed',
          right: '1em',
          bottom: '1em',
        }}
      />
    </Box>
  )
}
