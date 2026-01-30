import {
  StyledEngineProvider,
  ThemeProvider,
  createTheme,
} from '@mui/material/styles'
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
import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import App from './App'

export const colorTheme = (type, spacing, other) => {
  return createTheme({
    spacing: spacing == 'comfortable' ? 8 : spacing == 'compact' ? 4 : 2,
    colorSchemes: {
      light: {
        palette: {
          primary: {
            main: {
              init: blue[500],
              line: green[600],
              call: teal[500],
              return: lightGreen[700],
              exception: deepOrange[500],
              shell: indigo[500],
              dead: grey[600],
            }[type],
          },
          secondary: {
            main: pink['A400'],
          },
          neutral: {
            main: grey[700],
          },
        },
      },
      dark: {
        palette: {
          primary: {
            main: {
              init: blue.A200,
              line: green.A200,
              call: teal.A200,
              return: lightGreen.A200,
              exception: deepOrange.A200,
              shell: indigo.A200,
              dead: grey.A200,
            }[type],
          },
          secondary: {
            main: pink.A200,
          },
          neutral: {
            main: grey[600],
          },
        },
      },
    },
    cssVariables: {
      colorSchemeSelector: 'class',
    },
    ...other,
  })
}

export default function ThemedApp() {
  const themeType = useSelector(state => state.theme)
  const spacing = useSelector(state => state.spacing)

  const theme = useMemo(
    () => colorTheme(themeType || 'line', spacing),
    [themeType, spacing]
  )

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </StyledEngineProvider>
  )
}
