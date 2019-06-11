import { useDispatch, useSelector } from 'react-redux'
import List from '@material-ui/core/List'
import React, { useEffect } from 'react'

import { /* getFrames,*/ setActiveFrame } from './actions'
import Frame from './Frame'

export default function Frames() {
  const frames = useSelector(state => state.frames)
  const dispatch = useDispatch()

  useEffect(() => {
    frames.length && dispatch(setActiveFrame(frames[0].key))
  }, [dispatch, frames])

  return (
    <List>
      {frames.map((frame, i) => (
        <Frame key={frame.key} frame={frame} last={i === frames.length - 1} />
      ))}
    </List>
  )
}
