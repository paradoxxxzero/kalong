import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import { pink, red } from '@mui/material/colors'
import React from 'react'
import { useSelector } from 'react-redux'

export default function GlobalIndicator({ sx }) {
  const level = useSelector(state => state.loadingLevel)
  const connectionState = useSelector(state => state.connection.state)

  const full =
    connectionState === 'closed' || (connectionState === 'open' && level === 0)
  return (
    <Paper
      elevation={4}
      sx={[
        {
          display: 'flex',
          alignSelf: 'center',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Tooltip title={`${level} pending request${level > 1 ? 's' : ''}.`}>
        <CircularProgress
          sx={theme => ({
            m: 1,
            transition: theme.transitions.create(['color'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
            color: {
              connecting: pink[200],
              closed: red[900],
            }[connectionState],
          })}
          variant={full ? 'determinate' : undefined}
          value={full ? 100 : undefined}
        ></CircularProgress>
      </Tooltip>
    </Paper>
  )
}
