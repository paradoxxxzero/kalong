import { MuiThemeProvider, createMuiTheme } from '@material-ui/core'
import React from 'react'
import green from '@material-ui/core/colors/green'
import grey from '@material-ui/core/colors/grey'
import brown from '@material-ui/core/colors/brown'
import orange from '@material-ui/core/colors/orange'
import blueGrey from '@material-ui/core/colors/blueGrey'

import App from './App'
import { useSelector } from 'react-redux'

const base = {}

export const muiThemes = {
  init: createMuiTheme({ ...base, palette: { primary: { main: brown[500] } } }),
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
    <MuiThemeProvider theme={muiThemes[theme] || muiThemes.line}>
      <App />
    </MuiThemeProvider>
  )
}
