import List from '@mui/material/List'
import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import Frame from './Frame'
import { scrollIntoViewIfNeeded } from './util'

export default function Frames() {
  const frames = useSelector(state => state.frames)
  const activeFrame = useSelector(state => state.activeFrame)
  const spacing = useSelector(state => state.spacing)
  const listRef = useRef()

  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelectorAll('.Mui-selected')
      if (selected.length) {
        scrollIntoViewIfNeeded(selected[0])
      }
    }
  }, [activeFrame])

  return (
    <List ref={listRef} sx={{ p: 0 }} dense={spacing !== 'comfortable'}>
      {frames.map((frame, i) => (
        <Frame key={frame.key} frame={frame} last={i === frames.length - 1} />
      ))}
    </List>
  )
}
