import { Button, Chip, makeStyles } from '@material-ui/core'
import { useDispatch } from 'react-redux'
import React, { useCallback } from 'react'
import clsx from 'clsx'

import { requestInspect } from '../actions'
import { uid } from '../util'

const useStyles = makeStyles(() => ({
  button: {
    minWidth: 'auto',
    textTransform: 'none',
    padding: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    display: 'inline',
  },
}))

export default function Inspectable({
  id,
  type,
  className,
  children,
  ...props
}) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const handleClick = useCallback(() => {
    dispatch(requestInspect(uid(), id))
  }, [dispatch, id])
  const Component = type === 'chip' ? Chip : Button

  return (
    <Component
      onClick={handleClick}
      className={clsx(classes[type || 'button'], className)}
      component="a"
      {...props}
    >
      {children}
    </Component>
  )
}
