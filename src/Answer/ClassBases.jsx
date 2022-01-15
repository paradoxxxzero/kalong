import { Box } from '@mui/material'
import React from 'react'
import Inspectable from './Inspectable'

const arrowLength = '1em'
const arrowThickness = '3px'

export default function ClassBases({
  cls: { id, name, bases },
  first,
  last,
  root,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {!root && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: arrowLength,
            alignSelf: 'normal',
          }}
        >
          <Box
            sx={{
              flex: 1,
              borderLeft: first ? 'none' : `${arrowThickness} solid black`,
              borderBottom: `${arrowThickness} solid black`,
            }}
          />
          <Box
            sx={{
              flex: 1,
              borderLeft: first ? 'none' : `${arrowThickness} solid black`,
            }}
          />
        </Box>
      )}
      <Box sx={{ m: 0.5 }}>
        <Inspectable
          id={id}
          type="chip"
          label={name}
          color={['object', 'type'].includes(name) ? void 0 : 'secondary'}
        />
      </Box>
      {!!bases.length && (
        <Box
          sx={{
            borderBottom: `${arrowThickness} solid black`,
            width: arrowLength,
          }}
        />
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {bases.map((base, i) => (
          <ClassBases
            key={base.id}
            cls={base}
            first={i === 0}
            last={i === bases.length - 1}
          />
        ))}
      </Box>
    </Box>
  )
}
