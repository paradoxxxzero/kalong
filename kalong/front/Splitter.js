import { withStyles } from '@material-ui/core'
import React from 'react'
import classnames from 'classnames'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'

@withStyles(theme => ({
  wrapper: {
    display: 'flex',
  },
  horizontal: {
    flexDirection: 'column',
  },
  divider: {
    backgroundColor: theme.palette.text.primary,
    minWidth: '6px',
    minHeight: '6px',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    '&::before': {
      display: 'block',
      content: "''",
      background: theme.palette.background.paper,
      borderRadius: '15%',
    },
  },
  verticalDivider: {
    cursor: 'ew-resize',

    '&::before': {
      width: '50%',
      height: '5%',
    },
  },
  horizontalDivider: {
    cursor: 'ns-resize',

    '&::before': {
      width: '5%',
      height: '50%',
    },
  },
}))
export default class Splitter extends React.PureComponent {
  constructor(props) {
    super(props)
    this.splitter = React.createRef()

    this.state = {
      ratio: 50,
      origin: null,
    }

    this.handleTouchStart = this.handleTouchStart.bind(this)
    this.handleTouchMove = this.handleTouchMove.bind(this)
    this.handleTouchEnd = this.handleTouchEnd.bind(this)
  }

  getRelativePosition(event) {
    if (
      !this.splitter.current ||
      !this.splitter.current.getBoundingClientRect
    ) {
      return null
    }
    const { x: rx, y: ry } = this.splitter.current.getBoundingClientRect()
    const x = (event.touches ? event.touches[0] : event).clientX
    const y = (event.touches ? event.touches[0] : event).clientY
    return {
      x: x - rx,
      y: y - ry,
    }
  }

  handleTouchStart(event) {
    const origin = this.getRelativePosition(event)
    this.setState({ origin })
  }

  handleTouchMove() {
    const { vertical } = this.props
    const { origin } = this.state
    if (!origin) {
      return
    }
    const position = this.getRelativePosition(event)
    if (!position) {
      return null
    }
    const { width, height } = this.splitter.current.getBoundingClientRect()
    this.setState({
      ratio: (vertical ? position.x / width : position.y / height) * 100,
    })
  }

  handleTouchEnd() {
    this.setState({ origin: null })
  }

  render() {
    const { classes, children, className, vertical } = this.props
    const { ratio } = this.state
    if (React.Children.count(children) !== 2) {
      return null
    }

    return (
      <div
        className={classnames(
          className,
          classes.wrapper,
          vertical ? classes.vertical : classes.horizontal
        )}
        ref={this.splitter}
        onTouchMove={this.handleTouchMove}
        onMouseMove={this.handleTouchMove}
        onTouchEnd={this.handleTouchEnd}
        onMouseUp={this.handleTouchEnd}
      >
        <div
          style={{
            [vertical ? 'width' : 'height']: `${ratio}%`,
            display: 'flex',
            minHeight: 0,
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {children[0]}
        </div>
        <ClickAwayListener onClickAway={this.handleTouchEnd}>
          <div
            className={classnames(
              classes.divider,
              vertical ? classes.verticalDivider : classes.horizontalDivider
            )}
            onTouchStart={this.handleTouchStart}
            onMouseDown={this.handleTouchStart}
          />
        </ClickAwayListener>
        <div
          style={{
            display: 'flex',
            minHeight: 0,
            minWidth: 0,
            overflow: 'hidden',
            flex: 1,
          }}
        >
          {children[1]}
        </div>
      </div>
    )
  }
}
