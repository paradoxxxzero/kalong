import { Box } from '@mui/material'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import React, { useCallback, useRef, useState } from 'react'

const computeRelativePosition = (event, element) => {
  if (!element || !element.getBoundingClientRect) {
    return null
  }
  const { x: rx, y: ry } = element.getBoundingClientRect()
  const x = (event.touches ? event.touches[0] : event).clientX
  const y = (event.touches ? event.touches[0] : event).clientY
  return {
    x: x - rx,
    y: y - ry,
  }
}

export default function Splitter({ children, className, vertical }) {
  const [ratio, setRatio] = useState(50)
  const [origin, setOrigin] = useState(null)
  const splitter = useRef()

  const handleTouchStart = useCallback(event => {
    setOrigin(computeRelativePosition(event, splitter.current))
  }, [])

  const handleTouchMove = useCallback(
    event => {
      if (!origin) {
        return
      }
      const position = computeRelativePosition(event, splitter.current)
      if (!position) {
        return null
      }
      const { width, height } = splitter.current.getBoundingClientRect()
      setRatio(
        Math.min(
          100,
          Math.max(
            0,
            (vertical ? position.x / width : position.y / height) * 100
          )
        )
      )
    },
    [origin, vertical]
  )

  const handleTouchEnd = useCallback(() => {
    setOrigin(null)
  }, [])

  if (
    React.Children.count(children) !== 2 ||
    !React.Children.map(children, c => !!c).every(c => c)
  ) {
    return children
  }

  return (
    <Box
      ref={splitter}
      sx={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        flexDirection: vertical ? 'row' : 'column',
      }}
      onTouchMove={handleTouchMove}
      onMouseMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseUp={handleTouchEnd}
    >
      <Box
        style={{
          [vertical ? 'width' : 'height']: `${ratio}%`,
          display: 'flex',
          minHeight: 0,
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        {children[0]}
      </Box>
      <ClickAwayListener onClickAway={handleTouchEnd}>
        <Box
          sx={theme => ({
            backgroundColor: theme.palette.text.primary,
            minWidth: '6px',
            minHeight: '6px',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: vertical ? 'ew-resize' : 'ns-resize',

            '&::before': {
              display: 'block',
              content: "''",
              background: theme.palette.background.paper,
              borderRadius: '15%',
              width: vertical ? 0.5 : 0.05,
              height: vertical ? 0.05 : 0.5,
            },
          })}
          onTouchStart={handleTouchStart}
          onMouseDown={handleTouchStart}
        />
      </ClickAwayListener>
      <Box
        style={{
          display: 'flex',
          minHeight: 0,
          minWidth: 0,
          overflow: 'hidden',
          flex: 1,
        }}
      >
        {children[1]}
      </Box>
    </Box>
  )
}
