import { Tooltip } from '@material-ui/core'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos'
import IconButton from '@material-ui/core/IconButton'
import React from 'react'
import RedoIcon from '@material-ui/icons/Redo'
import Typography from '@material-ui/core/Typography'

@connect(state => ({
  title: state.title,
}))
@withStyles(() => ({
  grow: {
    flexGrow: 1,
  },
  steps: {},
}))
export default class Top extends React.PureComponent {
  constructor(props) {
    super(props)
    this.handleStepInto = this.handleStepInto.bind(this)
    this.handleStep = this.handleStep.bind(this)
    this.handleStepOut = this.handleStepOut.bind(this)
    this.handleStepUntil = this.handleStepUntil.bind(this)
    this.handleContinue = this.handleContinue.bind(this)
  }

  handleStepInto() {}
  handleStep() {}
  handleStepOut() {}
  handleStepUntil() {}
  handleContinue() {}

  render() {
    const { classes, title } = this.props
    return (
      <>
        <Typography variant="h6" color="inherit" noWrap>
          {title}
        </Typography>
        <div className={classes.grow} />
        <div className={classes.steps}>
          <Tooltip title="Step Into function call">
            <IconButton color="inherit" onClick={this.handleStepInto}>
              <ArrowDownwardIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Step to the next instruction">
            <IconButton color="inherit" onClick={this.handleStep}>
              <ArrowForwardIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Step Out of the current function">
            <IconButton color="inherit" onClick={this.handleStepOut}>
              <ArrowUpwardIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Step Until next line (bypass loops)">
            <IconButton color="inherit" onClick={this.handleStepUntil}>
              <RedoIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Continue the program">
            <IconButton color="inherit" onClick={this.handleContinue}>
              <ArrowForwardIosIcon />
            </IconButton>
          </Tooltip>
        </div>
      </>
    )
  }
}
