import {
  ThemeProvider,
  StyledEngineProvider,
  createTheme,
  adaptV4Theme,
} from '@mui/material'
import React from 'react'

import App from './App'
import { useSelector } from 'react-redux'

import { green, grey, brown, orange, blueGrey } from '@mui/material/colors'

const base = {
  mixins: {
    toolbar: {
      minHeight: 56,
      // '@media (min-width:0px) and (orientation: landscape)': { minHeight: 48 },
      '@media (min-width:600px)': { minHeight: 64 },
    },
  },
}

export const muiThemes = {
  init: createTheme({ ...base, palette: { primary: { main: brown[500] } } }),
  line: createTheme({ ...base, palette: { primary: { main: green[600] } } }),
  call: createTheme({ ...base, palette: { primary: { main: green[400] } } }),
  return: createTheme({
    ...base,
    palette: { primary: { main: green[800] } },
  }),
  exception: createTheme({
    ...base,
    palette: { primary: { main: orange[400] } },
  }),
  shell: createTheme({
    ...base,
    palette: { primary: { main: blueGrey[700] } },
  }),
  dead: createTheme({ ...base, palette: { primary: { main: grey[900] } } }),
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
