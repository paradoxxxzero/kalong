import createTheme from '@mui/material/styles/createTheme'
import StyledEngineProvider from '@mui/material/StyledEngineProvider'
import ThemeProvider from '@mui/material/styles/ThemeProvider'
import {
  blue,
  deepOrange,
  green,
  grey,
  indigo,
  lightGreen,
  pink,
  teal,
} from '@mui/material/colors'
import React from 'react'
import { useSelector } from 'react-redux'
import App from './App'

const colorTheme = main =>
  createTheme({
    palette: {
      action: {
        selectedOpacity: 0.15,
      },
      primary: {
        main,
      },
      secondary: {
        main: pink['A400'],
      },
      neutral: {
        main: grey[700],
      },
    },
    mixins: {
      toolbar: {
        minHeight: 56,
        // '@media (min-width:0px) and (orientation: landscape)': { minHeight: 48 },
        '@media (min-width:600px)': { minHeight: 64 },
      },
    },
  })

export const muiThemes = {
  init: colorTheme(blue[500]),
  line: colorTheme(green[600]),
  call: colorTheme(teal[500]),
  return: colorTheme(lightGreen[700]),
  exception: colorTheme(deepOrange[500]),
  shell: colorTheme(indigo[500]),
  dead: colorTheme(grey[600]),
}

export default function ThemedApp() {
  const theme = useSelector(state => state.theme)

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={muiThemes[theme] || muiThemes.line}>
        <App />
      </ThemeProvider>
    </StyledEngineProvider>
  )
}
