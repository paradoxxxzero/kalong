import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import Source from './Source'
import Splitter from './Splitter'
import Terminal from './Terminal'
import {
  createTheme,
  ThemeProvider,
  useColorScheme,
  useTheme,
} from '@mui/material'
import { colorTheme } from './ThemedApp'

export default function Main() {
  const vertical = useMediaQuery('(min-aspect-ratio: 1/1)')
  const invert = useSelector(state => state.invert)
  const frames = useSelector(state => state.frames)
  const activeFrame = useSelector(state => state.activeFrame)
  const currentFile = frames.find(({ key }) => key === activeFrame)
  const themeType = useSelector(state => state.theme)
  const spacing = useSelector(state => state.spacing)
  const theme = useTheme()
  const { colorScheme } = useColorScheme()
  const sourceColorScheme =
    colorScheme &&
    (invert ? (colorScheme === 'light' ? 'dark' : 'light') : colorScheme)

  let source = currentFile ? <Source currentFile={currentFile} /> : null

  const subTheme = useMemo(() => {
    if (!invert || !sourceColorScheme) {
      return theme
    }
    return colorTheme(themeType || 'line', spacing, {
      cssVariables: {
        colorSchemeSelector: `.inverted-%s`,
      },
      cssVarPrefix: `inverted`,
    })
  }, [theme, invert, sourceColorScheme, spacing, themeType])

  if (source && invert) {
    source = (
      <ThemeProvider
        theme={subTheme}
        defaultMode={sourceColorScheme}
        modeStorageKey="submode"
        disableNestedContext
      >
        {source}
      </ThemeProvider>
    )
  }

  return (
    <Box
      component="main"
      sx={() => ({
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0, // Fix codemirror wrapping
      })}
    >
      <Box sx={theme => theme.mixins.toolbar} />
      <Splitter vertical={vertical}>
        {source}
        <Terminal />
      </Splitter>
    </Box>
  )
}
