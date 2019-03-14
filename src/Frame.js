import { Typography } from '@material-ui/core'
import { connect } from 'react-redux'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import React from 'react'

import { setActiveFrame } from './actions'
import Snippet from './Snippet'

export default connect(
  state => ({
    activeFrame: state.activeFrame,
  }),
  dispatch => ({
    selectFrame: key => dispatch(setActiveFrame(key)),
  })
)(
  class Frame extends React.PureComponent {
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
        <ListItem
          selected={frame.key === activeFrame}
          onClick={this.handleClick}
        >
          <ListItemText
            primary={frame.function}
            secondary={
              <>
                <Snippet>{frame.lineSource}</Snippet>
                <Typography component="span" color="textPrimary" noWrap>
                  {frame.filename}:{frame.lineNumber}
                </Typography>
              </>
            }
          />
        </ListItem>
      )
    }
  }
)
