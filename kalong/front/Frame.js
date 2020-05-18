import { ListItemSecondaryAction, Tooltip, Typography } from '@material-ui/core'
import { useSelector, useDispatch } from 'react-redux'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import React, { useCallback, memo } from 'react'
import StarIcon from '@material-ui/icons/Star'

import { setActiveFrame } from './actions'
import Snippet from './Code/Snippet'

export default memo(function Frame({ frame, last }) {
  const activeFrame = useSelector(state => state.activeFrame)
  const dispatch = useDispatch()
  const handleClick = useCallback(() => dispatch(setActiveFrame(frame.key)), [
    dispatch,
    frame,
  ])

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
              <StarIcon fontSize="small" />
            </div>
          </Tooltip>
        )}
      </ListItemSecondaryAction>
    </ListItem>
  )
})
