import { CircularProgress, Tooltip, withStyles } from '@material-ui/core'
import { connect } from 'react-redux'
import React from 'react'
import classnames from 'classnames'
import pink from '@material-ui/core/colors/pink'
import green from '@material-ui/core/colors/green'
import red from '@material-ui/core/colors/red'

@connect(state => ({
  level: state.loadingLevel,
  connection: state.connection,
}))
@withStyles(theme => ({
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
export default class GlobalIndicator extends React.PureComponent {
  render() {
    const {
      classes,
      level,
      connection: { state },
    } = this.props
    let indicator
    if (state === 'connecting') {
      indicator = (
        <CircularProgress
          className={classnames(classes.loader, classes.connecting)}
        />
      )
    } else if (state === 'closed') {
      indicator = (
        <CircularProgress
          className={classnames(classes.loader, classes.dead)}
          variant="static"
          value={100}
        />
      )
    } else if (state === 'open') {
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
}
