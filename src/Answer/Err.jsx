import React from 'react'
import Snippet from '../Snippet'

import { red } from '@mui/material/colors'

export default function Err({ text }) {
  return <Snippet sx={{ color: red[400] }} value={text} mode="text" />
}
