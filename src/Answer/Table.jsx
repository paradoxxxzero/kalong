import React from 'react'
import {
  Table as MuiTable,
  TableBody,
  TableHead,
  TableCell,
  TableRow,
} from '@mui/material'
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
