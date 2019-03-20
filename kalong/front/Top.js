import { Tooltip } from '@material-ui/core'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import StopIcon from '@material-ui/icons/Stop'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward'
import IconButton from '@material-ui/core/IconButton'
import React from 'react'
import RedoIcon from '@material-ui/icons/Redo'
import Typography from '@material-ui/core/Typography'

import { doCommand } from './actions'

@connect(
  state => ({
    title: state.title,
  }),
  dispatch => ({
    handleCommand: command => dispatch(doCommand(command)),
  })
)
@withStyles(() => ({
  grow: {
    flexGrow: 1,
  },
  steps: {},
}))
export default class Top extends React.PureComponent {
  render() {
    const { classes, title, handleCommand } = this.props
    return (
      <>
        <Typography variant="h6" color="inherit" noWrap>
          {title}
        </Typography>
        <div className={classes.grow} />
        <div className={classes.steps}>
          <Tooltip title="Step Into function call">
            <IconButton
              color="inherit"
              onClick={() => handleCommand('stepInto')}
            >
              <ArrowDownwardIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Step to the next instruction">
            <IconButton color="inherit" onClick={() => handleCommand('step')}>
              <ArrowForwardIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Step Out of the current function">
            <IconButton
              color="inherit"
              onClick={() => handleCommand('stepOut')}
            >
              <ArrowUpwardIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Step Until next line (bypass loops)">
            <IconButton
              color="inherit"
              onClick={() => handleCommand('stepUntil')}
            >
              <RedoIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Continue the program and stop at exceptions">
            <IconButton
              color="inherit"
              onClick={() => handleCommand('continue')}
            >
              <PlayArrowIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Stop debugging">
            <IconButton color="inherit" onClick={() => handleCommand('stop')}>
              <StopIcon />
            </IconButton>
          </Tooltip>
        </div>
      </>
    )
  }
}
