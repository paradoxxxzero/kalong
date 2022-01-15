import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Typography,
  makeStyles,
} from '@material-ui/core'
import { useDispatch } from 'react-redux'
import React, { useState, useCallback, memo } from 'react'
import clsx from 'clsx'
import { Close, RemoveRedEye, ExpandMore } from '@material-ui/icons'

import { prettyTime } from '../util'
import { removePromptAnswer, setActiveFrame } from '../actions'
import AnswerDispatch from './AnswerDispatch'
import Snippet from '../Snippet'

const useStyles = makeStyles(theme => ({
  header: {
    '& .MuiCardHeader-content': {
      minWidth: 0,
    },
  },
  answer: {
    minWidth: 0,
    padding: '0 16px',
    flex: 1,
  },
  prompt: {
    padding: '4px', // .CodeMirror pre padding and .CodeMirror-lines
  },
  element: {
    margin: '1em',
    display: 'flex',
    flexDirection: 'column',
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  content: {
    display: 'flex',
  },
}))

export default memo(function Answer({
  uid,
  answer,
  duration,
  prompt,
  command,
  frame,
}) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [expanded, setExpanded] = useState(true)
  const handleExpand = useCallback(() => setExpanded(x => !x), [])
  const handleView = useCallback(
    () => dispatch(setActiveFrame(frame)),
    [dispatch, frame]
  )
  const handleClose = useCallback(() => {
    dispatch(removePromptAnswer(uid))
  }, [dispatch, uid])

  return (
    <Card className={classes.element}>
      <CardHeader
        className={classes.header}
        avatar={
          <>
            <IconButton
              className={clsx(classes.expand, {
                [classes.expandOpen]: expanded,
              })}
              onClick={handleExpand}
            >
              <ExpandMore />
            </IconButton>
            {command && <Chip label={command} />}
          </>
        }
        title={<Snippet className={classes.prompt} value={prompt} noBreak />}
        titleTypographyProps={{ variant: 'h5', noWrap: true }}
        action={
          <>
            <IconButton onClick={handleView}>
              <RemoveRedEye />
            </IconButton>
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </>
        }
      />
      {!!(answer && answer.length) && (
        <>
          <Divider />
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent className={classes.content}>
              <Typography
                variant="body1"
                className={classes.answer}
                component="div"
              >
                {answer.map((props, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <AnswerDispatch key={i} {...props} />
                ))}
              </Typography>
              {duration && (
                <Snippet
                  className={classes.duration}
                  value={prettyTime(duration)}
                  noBreakAll
                />
              )}
            </CardContent>
          </Collapse>
        </>
      )}
    </Card>
  )
})
