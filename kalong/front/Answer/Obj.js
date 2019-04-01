import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core'
import React from 'react'

import { requestInspect } from '../actions'
import { uid } from '../util'
import Snippet from '../Code/Snippet'

@connect(
  () => ({}),
  dispatch => ({
    inspect: (key, id) => dispatch(requestInspect(key, id)),
  })
)
@withStyles(() => ({
  obj: {
    cursor: 'pointer',
  },
}))
export default class Obj extends React.PureComponent {
  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    const { id, inspect } = this.props
    inspect(uid(), id)
  }

  render() {
    const { classes, value } = this.props
    return (
      <Snippet
        className={classes.obj}
        value={value}
        onClick={this.handleClick}
      />
    )
  }
}
