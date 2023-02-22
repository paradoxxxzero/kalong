import React from 'react'

import Diff from './Diff'
import Err from './Err'
import Exception from './Exception'
import Inspect from './Inspect'
import Iterable from './Iterable'
import Mapping from './Mapping'
import Obj from './Obj'
import Out from './Out'
import Raw from './Raw'
import Table from './Table'

const TYPES = {
  out: Out,
  err: Err,
  obj: Obj,
  diff: Diff,
  table: Table,
  inspect: Inspect,
  iterable: Iterable,
  mapping: Mapping,
  exception: Exception,
  raw: Raw,
}

export default function AnswerDispatch({ type, ...props }) {
  const AnswerPart = TYPES[type]
  return <AnswerPart {...props} />
}
