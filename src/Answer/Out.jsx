import React from 'react'

import Snippet from '../Snippet'

export default function Out({ text }) {
  return <Snippet value={text} mode="text" />
}
