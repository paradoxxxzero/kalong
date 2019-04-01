import { withStyles } from '@material-ui/core'
import React from 'react'

import Err from './Err'
import Inspect from './Inspect'
import Obj from './Obj'
import Out from './Out'

const TYPES = {
  out: Out,
  err: Err,
  obj: Obj,
  inspect: Inspect,
}

@withStyles(() => ({
  answer: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    overflowWrap: 'break-word',
  },
}))
export default class Answer extends React.PureComponent {
  render() {
    const { classes, answer } = this.props
    return (
      <code className={classes.answer}>
        {answer.map(({ type, ...props }, i) => {
          const AnswerPart = TYPES[type]
          return (
            // eslint-disable-next-line react/no-array-index-key
            <AnswerPart key={i} {...props} />
          )
        })}
      </code>
    )
  }
}
