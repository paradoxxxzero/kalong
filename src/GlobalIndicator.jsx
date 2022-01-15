import { CircularProgress, Paper, Tooltip } from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import { useSelector } from 'react-redux'
import React from 'react'
import clsx from 'clsx'
import { green, pink, red } from '@mui/material/colors'

const useStyles = makeStyles(theme => ({
  paper: {
    alignSelf: 'center',
  },
  loader: {
    margin: theme.spacing(1),
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

export default function GlobalIndicator({ className }) {
  const level = useSelector(state => state.loadingLevel)
  const connectionState = useSelector(state => state.connection.state)
  const classes = useStyles()

  let indicator
  if (connectionState === 'connecting') {
    indicator = (
      <CircularProgress className={clsx(classes.loader, classes.connecting)} />
    )
  } else if (connectionState === 'closed') {
    indicator = (
      <CircularProgress
        className={clsx(classes.loader, classes.dead)}
        variant="determinate"
        value={100}
      />
    )
  } else if (connectionState === 'open') {
    if (level > 0) {
      indicator = (
        <CircularProgress className={clsx(classes.loader, classes.loading)} />
      )
    } else {
      indicator = (
        <CircularProgress
          className={clsx(classes.loader, classes.allgood)}
          variant="determinate"
          value={100}
        />
      )
    }
  }
  return (
    <Paper elevation={4} className={clsx(className, classes.paper)}>
      <Tooltip title={`${level} pending request${level > 1 ? 's' : ''}.`}>
        {indicator}
      </Tooltip>
    </Paper>
  )
}
