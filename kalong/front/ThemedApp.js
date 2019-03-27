import { MuiThemeProvider, createMuiTheme } from '@material-ui/core'
import { connect } from 'react-redux'
import React from 'react'
import green from '@material-ui/core/colors/green'
import orange from '@material-ui/core/colors/orange'

import App from './App'

const base = { typography: { useNextVariants: true } }

const muiThemes = {
  line: createMuiTheme({ ...base, palette: { primary: { main: green[500] } } }),
  call: createMuiTheme({ ...base, palette: { primary: { main: green[400] } } }),
  return: createMuiTheme({
    ...base,
    palette: { primary: { main: green[600] } },
  }),
  exception: createMuiTheme({
    ...base,
    palette: { primary: { main: orange[400] } },
  }),
}

@connect(state => ({
  theme: state.theme,
}))
export default class ThemedApp extends React.PureComponent {
  render() {
    const { theme } = this.props
    return (
      <MuiThemeProvider theme={muiThemes[theme]}>
        <App />
      </MuiThemeProvider>
    )
  }
}
