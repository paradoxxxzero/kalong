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
import CloseIcon from '@material-ui/icons/Close'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import React, { useState, useCallback, memo } from 'react'
import classnames from 'classnames'

import { prettyTime } from '../util'
import { removePromptAnswer } from '../actions'
import AnswerDispatch from './AnswerDispatch'
import Snippet from '../Code/Snippet'

const useStyles = makeStyles(theme => ({
  answer: {
    minWidth: 0,
    padding: '0 16px',
    flex: 1,
  },
  prompt: {
    display: 'block',
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
}) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [expanded, setExpanded] = useState(true)
  const handleExpand = useCallback(() => setExpanded(x => !x), [])
  const handleClose = useCallback(() => {
    dispatch(removePromptAnswer(uid))
  }, [dispatch, uid])
  return (
    <Card className={classes.element}>
      <CardHeader
        avatar={
          <>
            <IconButton
              className={classnames(classes.expand, {
                [classes.expandOpen]: expanded,
              })}
              onClick={handleExpand}
            >
              <ExpandMoreIcon />
            </IconButton>
            {command && <Chip label={command} />}
          </>
        }
        title={<Snippet className={classes.prompt} value={prompt} />}
        titleTypographyProps={{ variant: 'h5' }}
        action={
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        }
      />
      {!!(answer && answer.length) && (
        <>
          <Divider />
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent className={classes.content}>
              <Typography variant="h6" className={classes.answer}>
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
