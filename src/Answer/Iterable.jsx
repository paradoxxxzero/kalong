import { Button, IconButton, Typography } from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import {
  ExpandLess,
  ExpandMore,
  MoreHoriz,
  MoreVert,
  UnfoldLess,
  UnfoldMore,
} from '@mui/icons-material'
import React, { useCallback, useState } from 'react'
import Snippet from '../Snippet'
import AnswerDispatch from './AnswerDispatch'
import Inspectable from './Inspectable'

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    transition: '250ms ease-in-out box-shadow',
    '&:hover': {
      boxShadow: '0 0 5px rgba(0, 0, 0, .125)',
    },
  },
  noWrap: {
    whiteSpace: 'pre',
  },
  buttonSize: {
    fontSize: theme.typography.button.fontSize,
  },
  indented: {
    paddingLeft: '2em',
  },
  inline: {
    display: 'inline',
  },
  icon: {
    fontSize: '16px',
  },
  button: {
    padding: '4px',
  },
  count: {
    fontSize: '0.7em',
    fontStyle: 'italic',
  },
  ellipsis: {
    fontSize: '0.75em',
  },
  unbreakable: {
    whiteSpace: 'pre',
  },
  moreCount: {
    color: theme.palette.text.secondary,
  },
}))

export default function Iterable({ subtype, values, id, mapping }) {
  const sliceStep = Math.max(Math.min(50, values.length / 5), 20)
  const initialSlice = Math.min(values.length, sliceStep)
  const classes = useStyles()
  const [expanded, setExpanded] = useState(true)
  const [slice, setSlice] = useState(initialSlice)

  const handleSliceMore = useCallback(
    () => setSlice(slice => Math.min(values.length, slice + sliceStep)),
    [sliceStep, values.length]
  )
  const handleSliceFold = useCallback(
    () => setSlice(slice => (slice === 0 ? initialSlice : 0)),
    [initialSlice]
  )
  const handleUnSlice = useCallback(
    () => setSlice(values.length),
    [values.length]
  )
  const handleExpand = useCallback(() => setExpanded(x => !x), [])

  const open =
    { list: '[', set: '{', tuple: '(', dict: '{' }[subtype] ||
    `${subtype}(${mapping ? '{' : '['}`
  const close =
    { list: ']', set: '}', tuple: ')', dict: '}' }[subtype] ||
    `${mapping ? '}' : ']'})`
  const sliced = values.slice(0, slice)

  return (
    <div className={classes.root}>
      {!!values.length && (
        <Typography
          className={classes.count}
          color="textSecondary"
          component="span"
        >
          ({values.length}){' '}
        </Typography>
      )}
      <Inspectable id={id}>
        <Snippet mode="text" value={open} />
      </Inspectable>
      {!!values.length && (
        <IconButton
          onClick={handleSliceFold}
          className={classes.button}
          size="large"
        >
          {slice === 0 ? (
            <UnfoldMore className={classes.icon} />
          ) : (
            <UnfoldLess className={classes.icon} />
          )}
        </IconButton>
      )}
      <section
        className={
          expanded && sliced.length > 1 ? classes.indented : classes.inline
        }
      >
        {sliced.map((props, i) => (
          <span key={`member-${id}-${i}`} className={classes.unbreakable}>
            {mapping ? (
              <>
                <AnswerDispatch {...props.key} />
                <Snippet mode="text" value=": " />
                <AnswerDispatch {...props.value} />
              </>
            ) : (
              <AnswerDispatch {...props} />
            )}
            {i + 1 !== values.length && <Snippet mode="text" value=", " />}
            {expanded && sliced.length > 1 && <br />}
          </span>
        ))}
        {values.length > sliced.length && (
          <span className={classes.unbreakable}>
            <IconButton
              onClick={handleSliceMore}
              className={classes.button}
              size="large"
            >
              <MoreHoriz className={classes.icon} />
            </IconButton>
            <Button
              className={classes.moreCount}
              size="small"
              component="span"
              onClick={handleSliceMore}
            >
              {values.length - sliced.length} more
            </Button>
            {values.length > sliced.length + sliceStep && (
              <IconButton
                onClick={handleUnSlice}
                className={classes.button}
                size="large"
              >
                <MoreVert className={classes.icon} />
              </IconButton>
            )}
          </span>
        )}
      </section>
      <Inspectable id={id}>
        {values.length === 1 && open === '(' && (
          <Snippet mode="text" value="," />
        )}
        <Snippet mode="text" value={close} />
      </Inspectable>
      {sliced.length > 1 && (
        <IconButton
          onClick={handleExpand}
          className={classes.button}
          size="large"
        >
          {expanded ? (
            <ExpandLess className={classes.icon} />
          ) : (
            <ExpandMore className={classes.icon} />
          )}
        </IconButton>
      )}
    </div>
  )
}
