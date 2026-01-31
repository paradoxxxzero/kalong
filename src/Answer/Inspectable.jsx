import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
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
  const Component =
    type === 'chip' ? Chip : type === 'icon' ? IconButton : Button
  return (
    <Component
      onClick={handleClick}
      sx={[
        ...(type === 'button'
          ? [
              theme => ({
                minWidth: 'auto',
                textTransform: 'none',
                padding: theme.spacing(1),
                backgroundColor: 'rgba(0, 0, 0, .03)',
                display: 'inline',
              }),
              theme =>
                theme.applyStyles('dark', {
                  backgroundColor: 'rgba(0, 0, 0, .3)',
                }),
            ]
          : [{}]),
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
