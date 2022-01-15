import {
  ExpandLess,
  ExpandMore,
  MoreHoriz,
  MoreVert,
  UnfoldLess,
  UnfoldMore,
} from '@mui/icons-material'
import { Box, Button, IconButton, Typography } from '@mui/material'
import React, { useCallback, useState } from 'react'
import Snippet from '../Snippet'
import AnswerDispatch from './AnswerDispatch'
import Inspectable from './Inspectable'

export default function Iterable({ subtype, values, id, mapping }) {
  const sliceStep = Math.max(Math.min(50, values.length / 5), 20)
  const initialSlice = Math.min(values.length, sliceStep)
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
    <Box
      sx={{
        m: 1,
        p: 1,
        transition: '250ms ease-in-out box-shadow',
        '&:hover': {
          boxShadow: '0 0 5px rgba(0, 0, 0, .125)',
        },
      }}
    >
      {!!values.length && (
        <Typography
          sx={{
            fontSize: '0.7em',
            fontStyle: 'italic',
          }}
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
        <IconButton onClick={handleSliceFold} sx={{ p: 0.5 }} size="large">
          {slice === 0 ? (
            <UnfoldMore sx={{ fontSize: '16px' }} />
          ) : (
            <UnfoldLess sx={{ fontSize: '16px' }} />
          )}
        </IconButton>
      )}
      <Box
        component="section"
        sx={{
          pl: expanded && sliced.length > 1 ? 1 : undefined,
          display: expanded && sliced.length > 1 ? undefined : 'inline',
        }}
      >
        {sliced.map((props, i) => (
          <Box
            component="span"
            key={`member-${id}-${i}`}
            sx={{ whiteSpace: 'pre' }}
          >
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
          </Box>
        ))}
        {values.length > sliced.length && (
          <Box component="span" sx={{ whiteSpace: 'pre' }}>
            <IconButton onClick={handleSliceMore} sx={{ p: 0.5 }} size="large">
              <MoreHoriz sx={{ fontSize: '16px' }} />
            </IconButton>
            <Button
              sx={{ color: 'text.secondary' }}
              size="small"
              component="span"
              onClick={handleSliceMore}
            >
              {values.length - sliced.length} more
            </Button>
            {values.length > sliced.length + sliceStep && (
              <IconButton onClick={handleUnSlice} sx={{ p: 0.5 }} size="large">
                <MoreVert sx={{ fontSize: '16px' }} />
              </IconButton>
            )}
          </Box>
        )}
      </Box>
      <Inspectable id={id}>
        {values.length === 1 && open === '(' && (
          <Snippet mode="text" value="," />
        )}
        <Snippet mode="text" value={close} />
      </Inspectable>
      {sliced.length > 1 && (
        <IconButton onClick={handleExpand} sx={{ p: 0.5 }} size="large">
          {expanded ? (
            <ExpandLess sx={{ fontSize: '16px' }} />
          ) : (
            <ExpandMore sx={{ fontSize: '16px' }} />
          )}
        </IconButton>
      )}
    </Box>
  )
}
