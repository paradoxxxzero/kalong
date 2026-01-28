import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import React, { useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import Answer from './Answer'
import Prompt from './Prompt'
import { Link } from '@mui/material'
import { VERSION } from '.'

export default (function Terminal() {
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
        sx={{
          pt: 1,
          px: 2,
          fontSize: '0.75em',
          color: theme => theme.vars.palette.neutral.main,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="body2">
          <code style={{ fontWeight: 600 }}>?help</code> to get some help
        </Typography>
        <Typography variant="body2">
          Kalong v
          <Link
            href="https://github.com/paradoxxxzero/kalong/tags"
            underline="hover"
          >
            {VERSION}
          </Link>
        </Typography>
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
