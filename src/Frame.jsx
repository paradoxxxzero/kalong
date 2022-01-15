import { ListItemSecondaryAction, Tooltip, Typography } from '@mui/material'
import { useSelector, useDispatch } from 'react-redux'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import React, { useCallback, memo } from 'react'
import { Star } from '@mui/icons-material'

import { setActiveFrame } from './actions'
import Snippet from './Snippet'

export default memo(function Frame({ frame, last }) {
  const activeFrame = useSelector(state => state.activeFrame)
  const dispatch = useDispatch()
  const handleClick = useCallback(
    () => dispatch(setActiveFrame(frame.key)),
    [dispatch, frame]
  )

  return (
    <ListItem
      button
      divider={!last}
      selected={frame.key === activeFrame}
      onClick={handleClick}
    >
      <ListItemText
        primary={frame.function}
        secondary={
          <>
            <Snippet value={frame.lineSource} />
            <Tooltip title={frame.absoluteFilename}>
              <Typography
                variant="body2"
                display="block"
                component="span"
                noWrap
              >
                {frame.filename}:{frame.lineNumber}
              </Typography>
            </Tooltip>
          </>
        }
      />
      <ListItemSecondaryAction>
        {frame.active && (
          <Tooltip title="Current Frame">
            <div>
              <Star fontSize="small" />
            </div>
          </Tooltip>
        )}
      </ListItemSecondaryAction>
    </ListItem>
  )
})
