import React from 'react'
import Snippet from '../Snippet'

export default function Err({ text }) {
  return (
    <Snippet
      sx={theme => ({ color: theme.vars.palette.error.main })}
      value={text}
      mode="text"
    />
  )
}
