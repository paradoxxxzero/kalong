import { CircularProgress, Tooltip, makeStyles } from '@material-ui/core'
import { useSelector } from 'react-redux'
import React from 'react'
import classnames from 'classnames'
import green from '@material-ui/core/colors/green'
import pink from '@material-ui/core/colors/pink'
import red from '@material-ui/core/colors/red'

const useStyles = makeStyles(theme => ({
  loader: {
    margin: theme.spacing(2),
    transition: theme.transitions.create(['color'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.standard,
    }),
  },
  connecting: {
    color: pink[200],
  },
  allgood: {
    color: green[300],
  },
  dead: {
    color: red[900],
  },
}))

export default function GlobalIndicator() {
  const level = useSelector(state => state.loadingLevel)
  const connectionState = useSelector(state => state.connection.state)
  const classes = useStyles()

  let indicator
  if (connectionState === 'connecting') {
    indicator = (
      <CircularProgress
        className={classnames(classes.loader, classes.connecting)}
      />
    )
  } else if (connectionState === 'closed') {
    indicator = (
      <CircularProgress
        className={classnames(classes.loader, classes.dead)}
        variant="static"
        value={100}
      />
    )
  } else if (connectionState === 'open') {
    if (level > 0) {
      indicator = (
        <CircularProgress
          className={classnames(classes.loader, classes.loading)}
        />
      )
    } else {
      indicator = (
        <CircularProgress
          className={classnames(classes.loader, classes.allgood)}
          variant="static"
          value={100}
        />
      )
    }
  }
  return (
    <Tooltip title={`${level} pending request${level > 1 ? 's' : ''}.`}>
      {indicator}
    </Tooltip>
  )
}
