import { Close, ExpandMore, RemoveRedEye } from '@mui/icons-material'
import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Typography,
} from '@mui/material'
import React, { memo, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { removePromptAnswer, setActiveFrame } from '../actions'
import Snippet from '../Snippet'
import { prettyTime } from '../util'
import AnswerDispatch from './AnswerDispatch'
import { Tooltip } from '@mui/material'

export default memo(function Answer({
  uid,
  answer,
  duration,
  prompt,
  command,
  frame,
}) {
  const dispatch = useDispatch()
  const [expanded, setExpanded] = useState(true)
  const frames = useSelector(state => state.frames)
  const currentFrame = frames.find(({ key }) => key === frame)
  const handleExpand = useCallback(() => setExpanded(x => !x), [])
  const handleView = useCallback(
    () => dispatch(setActiveFrame(frame)),
    [dispatch, frame]
  )
  const handleClose = useCallback(() => {
    dispatch(removePromptAnswer(uid))
  }, [dispatch, uid])

  return (
    <Card sx={{ m: 1, display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        sx={{
          '.MuiCardHeader-content': {
            minWidth: 0,
          },
        }}
        avatar={
          <>
            <IconButton
              sx={theme => ({
                transform: `rotate(${expanded ? 180 : 0}deg)`,
                marginLeft: 'auto',
                transition: theme.transitions.create('transform', {
                  duration: theme.transitions.duration.shortest,
                }),
              })}
              onClick={handleExpand}
              size="small"
            >
              <ExpandMore />
            </IconButton>
            {command && <Chip label={command} />}
          </>
        }
        title={
          <Tooltip title={prompt}>
            <Snippet sx={{ p: 0.5 }} value={prompt} noBreak />
          </Tooltip>
        }
        titleTypographyProps={{ variant: 'h5', noWrap: true }}
        action={
          <>
            <Tooltip
              title={
                currentFrame
                  ? `${currentFrame.absoluteFilename}:${currentFrame.lineNumber}`
                  : '?'
              }
            >
              <IconButton onClick={handleView} size="large">
                <RemoveRedEye />
              </IconButton>
            </Tooltip>
            <IconButton onClick={handleClose} size="large">
              <Close />
            </IconButton>
          </>
        }
      />
      {!!(answer && answer.length) && (
        <>
          <Divider />
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent
              sx={{
                display: 'flex',
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  minWidth: 0,
                  px: 2,
                  py: 0,
                  flex: 1,
                }}
                component="div"
              >
                {answer.map((props, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <AnswerDispatch key={i} {...props} />
                ))}
              </Typography>
              {duration && <Snippet value={prettyTime(duration)} />}
            </CardContent>
          </Collapse>
        </>
      )}
    </Card>
  )
})
