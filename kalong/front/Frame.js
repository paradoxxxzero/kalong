import { ListItemSecondaryAction, Tooltip, Typography } from '@material-ui/core'
import { connect } from 'react-redux'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import React from 'react'
import StarIcon from '@material-ui/icons/Star'

import { setActiveFrame } from './actions'
import Snippet from './Code/Snippet'

@connect(
  state => ({
    activeFrame: state.activeFrame,
  }),
  dispatch => ({
    selectFrame: key => dispatch(setActiveFrame(key)),
  })
)
export default class Frame extends React.PureComponent {
  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    const { frame, selectFrame } = this.props
    selectFrame(frame.key)
  }

  render() {
    const { frame, activeFrame, last } = this.props
    return (
      <ListItem
        button
        divider={!last}
        selected={frame.key === activeFrame}
        onClick={this.handleClick}
      >
        <ListItemText
          primary={frame.function}
          secondary={
            <>
              <Snippet value={frame.lineSource} />
              <Tooltip title={frame.absoluteFilename}>
                <Typography
                  variant="body2"
                  display="block"
                  component="span"
                  noWrap
                >
                  {frame.filename}:{frame.lineNumber}
                </Typography>
              </Tooltip>
            </>
          }
        />
        <ListItemSecondaryAction>
          {frame.active && (
            <Tooltip title="Current Frame">
              <div>
                <StarIcon fontSize="small" />
              </div>
            </Tooltip>
          )}
        </ListItemSecondaryAction>
      </ListItem>
    )
  }
}
