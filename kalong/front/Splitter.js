import { makeStyles } from '@material-ui/core'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import React, { useRef, useState, useCallback } from 'react'
import classnames from 'classnames'

const useStyles = makeStyles(theme => ({
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

const computeRelativePosition = (event, element) => {
  if (!element || !element.getBoundingClientRect) {
    return null
  }
  const { x: rx, y: ry } = element.getBoundingClientRect()
  const x = (event.touches ? event.touches[0] : event).clientX
  const y = (event.touches ? event.touches[0] : event).clientY
  return {
    x: x - rx,
    y: y - ry,
  }
}

export default function Splitter({ children, className, vertical }) {
  const classes = useStyles()
  const [ratio, setRatio] = useState(50)
  const [origin, setOrigin] = useState(null)
  const splitter = useRef()

  const handleTouchStart = useCallback(event => {
    setOrigin(computeRelativePosition(event, splitter.current))
  }, [])

  const handleTouchMove = useCallback(
    event => {
      if (!origin) {
        return
      }
      const position = computeRelativePosition(event, splitter.current)
      if (!position) {
        return null
      }
      const { width, height } = splitter.current.getBoundingClientRect()
      setRatio(
        Math.min(
          100,
          Math.max(
            0,
            (vertical ? position.x / width : position.y / height) * 100
          )
        )
      )
    },
    [origin, vertical]
  )

  const handleTouchEnd = useCallback(() => {
    setOrigin(null)
  }, [])

  if (
    React.Children.count(children) !== 2 ||
    !React.Children.map(children, c => !!c).every(c => c)
  ) {
    return children
  }

  return (
    <div
      className={classnames(
        className,
        classes.wrapper,
        vertical ? classes.vertical : classes.horizontal
      )}
      ref={splitter}
      onTouchMove={handleTouchMove}
      onMouseMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseUp={handleTouchEnd}
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
      <ClickAwayListener onClickAway={handleTouchEnd}>
        <div
          className={classnames(
            classes.divider,
            vertical ? classes.verticalDivider : classes.horizontalDivider
          )}
          onTouchStart={handleTouchStart}
          onMouseDown={handleTouchStart}
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
