import { Box, Typography } from '@mui/material'
import React, { useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import Answer from './Answer'
import Prompt from './Prompt'

export default (function Terminal({ className }) {
  const scrollback = useSelector(state => state.scrollback)
  const scroller = useRef()
  const handleScrollUp = useCallback(() => {
    scroller.current.scrollTop -= 300
  }, [scroller])

  const handleScrollDown = useCallback(() => {
    scroller.current.scrollTop += 300
  }, [scroller])

  const scrollToBottom = useCallback(() => {
    scroller.current.scrollTop = scroller.current.scrollHeight
  }, [])

  return (
    <Box
      sx={{ flex: 1, overflowY: 'auto', scrollBehavior: 'smooth' }}
      ref={scroller}
    >
      <Typography
        variant="h6"
        sx={{ pt: 1, px: 2, fontSize: '0.75em', color: '#999' }}
      >
        Type <code style={{ fontWeight: 600 }}>?help</code> to get some help
      </Typography>
      {scrollback.map(({ key, ...props }) => (
        <Answer key={key} uid={key} {...props} />
      ))}
      <Prompt
        onScrollUp={handleScrollUp}
        onScrollDown={handleScrollDown}
        scrollToBottom={scrollToBottom}
      />
    </Box>
  )
})
