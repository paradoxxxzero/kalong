import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import React from 'react'
import { useSelector } from 'react-redux'
import Source from './Source'
import Splitter from './Splitter'
import Terminal from './Terminal'

export default function Main() {
  const vertical = useMediaQuery('(min-aspect-ratio: 1/1)')
  const frames = useSelector(state => state.frames)
  const activeFrame = useSelector(state => state.activeFrame)
  const currentFile = frames.find(({ key }) => key === activeFrame)

  return (
    <Box
      component="main"
      sx={theme => ({
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        zIndex: theme.zIndex.drawer + 1,
        minWidth: 0, // Fix codemirror wrapping
      })}
    >
      <Box sx={theme => theme.mixins.toolbar} />
      <Splitter vertical={vertical}>
        {currentFile && <Source currentFile={currentFile} />}
        <Terminal />
      </Splitter>
    </Box>
  )
}
