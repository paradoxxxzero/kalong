import makeStyles from '@mui/styles/makeStyles'
import clsx from 'clsx'
import React, { memo, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import Answer from './Answer'
import Prompt from './Prompt'

const useStyles = makeStyles({
  scrollback: {
    overflowY: 'auto',
    scrollBehavior: 'smooth',
  },
})

export default memo(function Terminal({ className }) {
  const scrollback = useSelector(state => state.scrollback)
  const classes = useStyles()
  const scroller = useRef()
  const handleScrollUp = useCallback(() => {
    scroller.current.scrollTop -= 300
  }, [scroller])

  const handleScrollDown = useCallback(() => {
    scroller.current.scrollTop += 300
  }, [scroller])

  // useEffect(() => {
  //   scroller.current.scrollTop = scroller.current.scrollHeight
  // }, [scrollback])
  return (
    <div className={clsx(classes.scrollback, className)} ref={scroller}>
      {scrollback.map(({ key, ...props }) => (
        <Answer key={key} uid={key} {...props} />
      ))}
      <Prompt onScrollUp={handleScrollUp} onScrollDown={handleScrollDown} />
    </div>
  )
})
