import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core'
import React from 'react'
import classnames from 'classnames'

import Answer from './Answer'
import Prompt from './Prompt'

@connect(state => ({
  scrollback: state.scrollback,
}))
@withStyles(() => ({
  scrollback: {
    overflowY: 'auto',
    scrollBehavior: 'smooth',
  },
}))
export default class Terminal extends React.PureComponent {
  constructor(props) {
    super(props)

    this.scroller = React.createRef()
    this.handleScrollUp = this.handleScrollUp.bind(this)
    this.handleScrollDown = this.handleScrollDown.bind(this)
  }

  componentDidUpdate() {
    this.scroller.current.scrollTop = this.scroller.current.scrollHeight
  }

  handleScrollUp() {
    this.scroller.current.scrollTop -= 300
  }

  handleScrollDown() {
    this.scroller.current.scrollTop += 300
  }

  render() {
    const { classes, className, scrollback } = this.props
    return (
      <div
        className={classnames(classes.scrollback, className)}
        ref={this.scroller}
      >
        {scrollback.map(({ key, ...props }) => (
          <Answer key={key} uid={key} {...props} />
        ))}
        <Prompt
          onScrollUp={this.handleScrollUp}
          onScrollDown={this.handleScrollDown}
        />
      </div>
    )
  }
}
