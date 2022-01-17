import { Star } from '@mui/icons-material'
import {
  ListItemButton,
  ListItemSecondaryAction,
  Tooltip,
  Typography,
} from '@mui/material'
import ListItemText from '@mui/material/ListItemText'
import React, { memo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setActiveFrame } from './actions'
import Snippet from './Snippet'

export default memo(function Frame({ frame, last }) {
  const activeFrame = useSelector(state => state.activeFrame)
  const dispatch = useDispatch()
  const handleClick = useCallback(() => {
    dispatch(setActiveFrame(frame.key))
  }, [dispatch, frame.key])

  return (
    <ListItemButton
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
    </ListItemButton>
  )
})
