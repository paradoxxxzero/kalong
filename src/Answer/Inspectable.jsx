import { Button, Chip } from '@mui/material'
import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { requestInspect } from '../actions'
import { uid } from '../util'

export default function Inspectable({
  id,
  type = 'button',
  children,
  sx,
  ...props
}) {
  const dispatch = useDispatch()
  const handleClick = useCallback(() => {
    dispatch(requestInspect(uid(), id))
  }, [dispatch, id])
  const Component = type === 'chip' ? Chip : Button
  return (
    <Component
      onClick={handleClick}
      sx={[
        type === 'button'
          ? {
              minWidth: 'auto',
              textTransform: 'none',
              padding: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
              display: 'inline',
            }
          : {},
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      component="a"
      color="neutral"
      {...props}
    >
      {children}
    </Component>
  )
}
