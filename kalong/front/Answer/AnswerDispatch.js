import React from 'react'

import Err from './Err'
import Exception from './Exception'
import Inspect from './Inspect'
import Iterable from './Iterable'
import Mapping from './Mapping'
import Obj from './Obj'
import Out from './Out'

const TYPES = {
  out: Out,
  err: Err,
  obj: Obj,
  inspect: Inspect,
  iterable: Iterable,
  mapping: Mapping,
  exception: Exception,
}

export default class AnswerDispatch extends React.PureComponent {
  render() {
    const { type, ...props } = this.props
    const AnswerPart = TYPES[type]
    return <AnswerPart {...props} />
  }
}
