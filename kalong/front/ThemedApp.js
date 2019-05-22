import { MuiThemeProvider, createMuiTheme } from '@material-ui/core'
import React from 'react'
import { useSelector } from 'react-redux'
import green from '@material-ui/core/colors/green'
import grey from '@material-ui/core/colors/grey'
import orange from '@material-ui/core/colors/orange'
import blueGrey from '@material-ui/core/colors/blueGrey'

import App from './App'

const base = {}

const muiThemes = {
  init: createMuiTheme({ ...base, palette: { primary: { main: grey[400] } } }),
  line: createMuiTheme({ ...base, palette: { primary: { main: green[600] } } }),
  call: createMuiTheme({ ...base, palette: { primary: { main: green[400] } } }),
  return: createMuiTheme({
    ...base,
    palette: { primary: { main: green[800] } },
  }),
  exception: createMuiTheme({
    ...base,
    palette: { primary: { main: orange[400] } },
  }),
  shell: createMuiTheme({
    ...base,
    palette: { primary: { main: blueGrey[700] } },
  }),
  dead: createMuiTheme({ ...base, palette: { primary: { main: grey[900] } } }),
}

export default function ThemedApp() {
  const theme = useSelector(state => state.theme)
  return (
    <MuiThemeProvider theme={muiThemes[theme]}>
      <App />
    </MuiThemeProvider>
  )
}
