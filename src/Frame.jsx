import Star from '@mui/icons-material/Star'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
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
    <ListItem
      secondaryAction={
        frame.active && (
          <Tooltip title="Current Frame">
            <IconButton edge="end" aria-label="comments" onClick={handleClick}>
              <Star fontSize="small" />
            </IconButton>
          </Tooltip>
        )
      }
      disablePadding
    >
      <ListItemButton
        sx={theme => ({
          paddingTop: theme.spacing(2),
          paddingBottom: theme.spacing(2),
          paddingLeft: theme.spacing(4),
          paddingRight: theme.spacing(4),
        })}
        divider={!last}
        selected={frame.key === activeFrame}
        onClick={handleClick}
      >
        <ListItemText
          sx={{
            margin: 0,
          }}
          primary={frame.function}
          secondary={
            <>
              <Snippet value={frame.lineSource} noWrap />
              <Tooltip title={frame.absoluteFilename}>
                <Typography variant="body2" noWrap component="span">
                  {frame.filename}:{frame.lineNumber}
                </Typography>
              </Tooltip>
            </>
          }
        />
      </ListItemButton>
    </ListItem>
  )
})
