import React from 'react'

import Inspectable from './Inspectable'
import Snippet from '../Snippet'

export default function Obj({ id, value }) {
  return (
    <Inspectable id={id}>
      <Snippet value={value} />
    </Inspectable>
  )
}
