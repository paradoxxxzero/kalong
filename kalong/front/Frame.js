import { ListItemIcon, Tooltip, Typography } from '@material-ui/core'
import { connect } from 'react-redux'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import LocalLibraryIcon from '@material-ui/icons/LocalLibrary'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import React from 'react'

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
    const { frame, activeFrame } = this.props
    return (
      <ListItem selected={frame.key === activeFrame} onClick={this.handleClick}>
        <ListItemIcon>
          {frame.active ? <PlayArrowIcon /> : <LocalLibraryIcon />}
        </ListItemIcon>
        <ListItemText
          primary={frame.function}
          secondary={
            <>
              <Snippet>{frame.lineSource}</Snippet>
              <Tooltip title={frame.filename}>
                <Typography component="span" color="textPrimary" noWrap>
                  {frame.stem}:{frame.lineNumber}
                </Typography>
              </Tooltip>
            </>
          }
        />
      </ListItem>
    )
  }
}
