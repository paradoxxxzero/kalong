import React from 'react'
import MuiTable from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableHead from '@mui/material/TableHead'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

import Obj from './Obj'

export default function Table({ columns, rows }) {
  return (
    <MuiTable>
      <TableHead>
        <TableRow>
          {columns.map(column => (
            <TableCell key={column}>{column}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i}>
            {columns.map((column, j) => (
              <TableCell key={j}>
                {row[column].value ? (
                  <Obj value={row[column].value} id={row[column].id} />
                ) : null}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </MuiTable>
  )
}
