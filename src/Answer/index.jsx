import {
  Close,
  ContentCopy,
  ExpandMore,
  Map,
  Refresh,
  Visibility,
} from '@mui/icons-material'
import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { memo, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  refreshPrompt,
  removePromptAnswer,
  setActiveFrame,
  setWatching,
} from '../actions'
import Snippet from '../Snippet'
import { prettyTime } from '../util'
import AnswerDispatch from './AnswerDispatch'

export default memo(function Answer({
  uid,
  answer,
  duration,
  prompt,
  command,
  frame,
  watching,
}) {
  const dispatch = useDispatch()
  const [expanded, setExpanded] = useState(true)
  const [actionExpanded, setActionExpanded] = useState(false)
  const frames = useSelector(state => state.frames)
  const currentFrame = frames.find(({ key }) => key === frame)
  const activeFrame = useSelector(state => state.activeFrame)
  const handleExpand = useCallback(() => setExpanded(x => !x), [])
  const handleActionExpand = useCallback(() => setActionExpanded(x => !x), [])
  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(prompt)
  }, [prompt])

  const handleWatch = useCallback(
    () =>
      dispatch(
        setWatching(
          uid,
          watching === 'frame' ? 'all' : watching === 'all' ? null : 'frame'
        )
      ),
    [dispatch, uid, watching]
  )
  const handleRefresh = useCallback(
    () => dispatch(refreshPrompt(uid, prompt, command, activeFrame)),
    [activeFrame, command, dispatch, prompt, uid]
  )
  const handleView = useCallback(
    () => dispatch(setActiveFrame(frame)),
    [dispatch, frame]
  )
  const handleClose = useCallback(() => {
    dispatch(removePromptAnswer(uid))
  }, [dispatch, uid])

  return (
    <Card
      sx={{
        m: 1,
        display: 'flex',
        flexDirection: 'column',
        opacity: frame === activeFrame ? 1 : 0.75,
        filter: currentFrame ? 'none' : 'grayscale(50%)',
        transition: theme =>
          theme.transitions.create(['opacity', 'box-shadow']),
      }}
    >
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
            <IconButton
              sx={theme => ({
                transform: `rotate(${actionExpanded ? -90 : 90}deg)`,
                marginLeft: 'auto',
                transition: theme.transitions.create('transform'),
              })}
              onClick={handleActionExpand}
              size="small"
            >
              <ExpandMore />
            </IconButton>
            <Collapse
              mountOnEnter
              unmountOnExit
              in={actionExpanded}
              sx={{ display: 'inline-flex' }}
              // direction="up"
              orientation="horizontal"
            >
              <IconButton onClick={handleCopy} size="small">
                <ContentCopy />
              </IconButton>
            </Collapse>

            {currentFrame ? (
              <Collapse
                mountOnEnter
                unmountOnExit
                in={actionExpanded}
                sx={{ display: 'inline-flex' }}
                // direction="up"
                orientation="horizontal"
              >
                <Tooltip
                  title={`${currentFrame.absoluteFilename}:${currentFrame.lineNumber}`}
                >
                  <IconButton onClick={handleView} size="small">
                    <Map />
                  </IconButton>
                </Tooltip>
              </Collapse>
            ) : null}
            <Collapse
              mountOnEnter
              unmountOnExit
              in={actionExpanded}
              sx={{ display: 'inline-flex' }}
              // direction="up"
              orientation="horizontal"
            >
              <IconButton onClick={handleRefresh} size="small">
                <Refresh />
              </IconButton>
            </Collapse>

            <Collapse
              mountOnEnter
              unmountOnExit
              in={actionExpanded || watching}
              sx={{ display: 'inline-flex' }}
              // direction="up"
              orientation="horizontal"
            >
              <IconButton
                onClick={handleWatch}
                size="small"
                sx={{
                  color:
                    watching === 'all'
                      ? 'warning.main'
                      : watching === 'frame'
                      ? 'info.main'
                      : undefined,
                }}
              >
                <Visibility />
              </IconButton>
            </Collapse>
            <IconButton onClick={handleClose} size="large">
              <Close />
            </IconButton>
          </>
        }
      />
      {!!(answer && answer.length) && (
        <>
          <Divider />
          <Collapse
            in={expanded}
            timeout="auto"
            unmountOnExit
            sx={{
              position: 'relative',
              '&::after': {
                content: '""',
                pointerEvents: 'none',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '300%',
                height: '100%',
                boxShadow: '0 0 20px 10px #fff inset',
              },
            }}
          >
            <CardContent
              sx={{
                display: 'flex',
                maxHeight: '50vh',
                overflow: 'auto',
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
              {duration ? <Snippet value={prettyTime(duration)} /> : null}
            </CardContent>
          </Collapse>
        </>
      )}
    </Card>
  )
})
