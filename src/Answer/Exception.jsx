import React, { useState } from 'react'

import ExceptionPart from './ExceptionPart'

export default function Exception({ causes, ...props }) {
  const [expanded, setExpanded] = useState(-1)
  const exceptions = [props, ...(causes || [])]

  return (
    <>
      {exceptions.map((exc, i) => (
        <ExceptionPart
          key={exc.id}
          i={i}
          expanded={expanded === i}
          onChange={setExpanded}
          {...exc}
        />
      ))}
    </>
  )
}
