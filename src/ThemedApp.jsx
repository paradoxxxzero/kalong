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

const base = {}

export const muiThemes = {
  init: createTheme(
    adaptV4Theme({ ...base, palette: { primary: { main: brown[500] } } })
  ),
  line: createTheme(
    adaptV4Theme({ ...base, palette: { primary: { main: green[600] } } })
  ),
  call: createTheme(
    adaptV4Theme({ ...base, palette: { primary: { main: green[400] } } })
  ),
  return: createTheme(
    adaptV4Theme({
      ...base,
      palette: { primary: { main: green[800] } },
    })
  ),
  exception: createTheme(
    adaptV4Theme({
      ...base,
      palette: { primary: { main: orange[400] } },
    })
  ),
  shell: createTheme(
    adaptV4Theme({
      ...base,
      palette: { primary: { main: blueGrey[700] } },
    })
  ),
  dead: createTheme(
    adaptV4Theme({ ...base, palette: { primary: { main: grey[900] } } })
  ),
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
