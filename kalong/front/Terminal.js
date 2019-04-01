import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core'
import React from 'react'

import Answer from './Answer'
import Prompt from './Prompt'

@connect(state => ({
  scrollback: state.scrollback,
}))
@withStyles(() => ({
  scrollback: {
    flex: 1,
    overflowY: 'scroll',
    scrollBehavior: 'smooth',
  },
}))
export default class Terminal extends React.PureComponent {
  constructor(props) {
    super(props)

    this.scroller = React.createRef()
  }

  componentDidUpdate() {
    this.scroller.current.scrollTop = this.scroller.current.scrollHeight
  }

  render() {
    const { classes, scrollback } = this.props
    return (
      <div className={classes.scrollback} ref={this.scroller}>
        {scrollback.map(({ key, ...props }) => (
          <Answer key={key} {...props} />
        ))}
        <Prompt />
      </div>
    )
  }
}
