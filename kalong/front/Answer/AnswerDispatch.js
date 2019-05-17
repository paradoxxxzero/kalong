import React from 'react'

import Diff from './Diff'
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
  diff: Diff,
  inspect: Inspect,
  iterable: Iterable,
  mapping: Mapping,
  exception: Exception,
}

export default function AnswerDispatch({ type, ...props }) {
  const AnswerPart = TYPES[type]
  return <AnswerPart {...props} />
}
