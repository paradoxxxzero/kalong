import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import MapIcon from '@mui/icons-material/Map'
import RefreshIcon from '@mui/icons-material/Refresh'
import VisibilityIcon from '@mui/icons-material/Visibility'
import PushPinIcon from '@mui/icons-material/PushPin'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

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

const ActionIcon = ({ open, onClick, title, color, icon }) => (
  <Collapse
    mountOnEnter
    unmountOnExit
    in={open}
    sx={{ display: 'inline-flex' }}
    // direction="up"
    orientation="horizontal"
  >
    <Tooltip title={title}>
      <IconButton sx={{ color }} onClick={onClick} size="small">
        {icon}
      </IconButton>
    </Tooltip>
  </Collapse>
)

export default memo(function Answer({
  uid,
  answer,
  duration,
  prompt,
  command,
  frame,
  level,
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
          watching === 'frame'
            ? 'all'
            : watching === 'all'
              ? 'pin.frame'
              : watching === 'pin.frame'
                ? 'pin.all'
                : watching === 'pin.all'
                  ? undefined
                  : 'frame'
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
        ml: 1 + level * 4,
        display: 'flex',
        flexDirection: 'column',
        opacity: frame === activeFrame ? 1 : 0.75,
        filter: currentFrame ? 'none' : 'grayscale(50%)',
        transition: theme =>
          theme.transitions.create(['opacity', 'box-shadow']),
      }}
    >
      <CardHeader
        slotProps={{
          root: {
            sx: theme => ({
              padding: theme.spacing(2),
            }),
          },
          title: {
            variant: 'h5',
            noWrap: true,
            padding: '4px 0', // Fixed as it comes from codemirror
          },
          content: {
            sx: {
              minWidth: 0,
            },
          },
          action: {
            sx: {
              alignSelf: 'center',
            },
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
              <ExpandMoreIcon />
            </IconButton>
            {command && <Chip label={command} />}
          </>
        }
        title={
          <Tooltip title={<Snippet value={prompt} forceColorScheme="dark" />}>
            <Snippet value={prompt} noBreak />
          </Tooltip>
        }
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
              <ExpandMoreIcon />
            </IconButton>

            <ActionIcon
              open={actionExpanded}
              onClick={handleCopy}
              title="Copy"
              icon={<ContentCopyIcon />}
            />

            {currentFrame ? (
              <ActionIcon
                open={actionExpanded}
                onClick={handleView}
                title={`Locate ${currentFrame.absoluteFilename}:${currentFrame.lineNumber}`}
                icon={<MapIcon />}
              />
            ) : null}
            <ActionIcon
              open={actionExpanded}
              onClick={handleRefresh}
              title="Refresh eval"
              icon={<RefreshIcon />}
            />
            <ActionIcon
              open={actionExpanded || watching}
              onClick={handleWatch}
              title="Watch frame/always/global pin frame/global pin always"
              color={
                watching?.includes('all')
                  ? 'warning.main'
                  : watching?.includes('frame')
                    ? 'info.main'
                    : undefined
              }
              icon={
                watching?.includes('pin.') ? (
                  <PushPinIcon />
                ) : (
                  <VisibilityIcon />
                )
              }
            />
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
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
              },
            }}
          >
            <CardContent
              sx={theme => ({
                display: 'flex',
                maxHeight: '40vh',
                overflow: 'auto',
                padding: theme.spacing(2),
                '&:last-child': {
                  paddingBottom: theme.spacing(3),
                },
              })}
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
