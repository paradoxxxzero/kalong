import { Button, Chip, makeStyles } from '@material-ui/core'
import { useDispatch } from 'react-redux'
import React, { useCallback } from 'react'
import classnames from 'classnames'

import { requestInspect } from '../actions'
import { uid } from '../util'

const useStyles = makeStyles(() => ({
  button: {
    minWidth: 'auto',
    textTransform: 'none',
    padding: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
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
      className={classnames(classes[type || 'button'], className)}
      {...props}
    >
      {children}
    </Component>
  )
}
