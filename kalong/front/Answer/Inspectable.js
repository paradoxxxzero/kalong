import { Button, makeStyles } from '@material-ui/core'
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

export default function Inspectable({ id, className, children }) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const handleClick = useCallback(() => {
    dispatch(requestInspect(uid(), id))
  }, [dispatch, id])
  return (
    <Button
      onClick={handleClick}
      className={classnames(classes.button, className)}
    >
      {children}
    </Button>
  )
}
