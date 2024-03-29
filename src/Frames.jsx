import List from '@mui/material/List'
import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setActiveFrame } from './actions'
import Frame from './Frame'
import { scrollIntoViewIfNeeded } from './util'

export default function Frames() {
  const frames = useSelector(state => state.frames)
  const activeFrame = useSelector(state => state.activeFrame)
  const listRef = useRef()
  const dispatch = useDispatch()

  useEffect(() => {
    frames.length && dispatch(setActiveFrame(frames[0].key))
  }, [dispatch, frames])

  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelectorAll('.Mui-selected')
      if (selected.length) {
        scrollIntoViewIfNeeded(selected[0])
      }
    }
  }, [activeFrame])

  return (
    <List ref={listRef} sx={{ p: 0 }}>
      {frames.map((frame, i) => (
        <Frame key={frame.key} frame={frame} last={i === frames.length - 1} />
      ))}
    </List>
  )
}
