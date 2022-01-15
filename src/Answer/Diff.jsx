import React from 'react'
import Snippet from '../Snippet'

export default function Diff({ diff }) {
  return <Snippet value={diff} mode="diff" />
}
