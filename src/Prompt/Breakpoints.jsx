import DeleteIcon from '@mui/icons-material/Delete'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleBreakpoint } from '../actions'

export default function Breakpoints() {
  const dispatch = useDispatch()
  const [selected, setSelected] = useState([])
  const breakpoints = useSelector(state => state.breakpoints)
  const numSelected = selected.length
  const rowCount = Object.values(breakpoints).reduce(
    (acc, lnos) => acc + lnos.length,
    0
  )

  const handleSelectAllClick = event => {
    if (event.target.checked) {
      const newSelected = Object.entries(breakpoints)
        .map(([file, lnos]) => lnos.map(lno => `${file}:${lno}`))
        .flat()
      setSelected(newSelected)
      return
    }
    setSelected([])
  }
  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id)
    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      )
    }
    setSelected(newSelected)
  }
  const handleRemove = () => {
    selected.forEach(id => {
      const [file, lno] = id.split(':')
      dispatch(toggleBreakpoint(file, parseInt(lno, 10)))
    })
    setSelected([])
  }

  return (
    <aside style={{ paddingBottom: '16px', fontSize: '.9em' }}>
      <Toolbar
        sx={[
          {
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
          },
          numSelected > 0 && {
            bgcolor: theme =>
              theme.alpha(
                theme.vars.palette.primary.main,
                theme.vars.palette.action.activatedOpacity
              ),
          },
        ]}
      >
        {numSelected > 0 ? (
          <Typography
            sx={{ flex: '1 1 100%' }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {numSelected} selected
          </Typography>
        ) : (
          <Typography
            sx={{ flex: '1 1 100%' }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            Nutrition
          </Typography>
        )}
        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton onClick={() => handleRemove()}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : null}
      </Toolbar>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={numSelected > 0 && numSelected < rowCount}
                  checked={rowCount > 0 && numSelected === rowCount}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              <TableCell>File</TableCell>
              <TableCell align="right">Line Number</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(breakpoints)
              .map(([file, lnos]) =>
                lnos.map(lno => (
                  <TableRow
                    role="checkbox"
                    hover
                    key={`${file}:${lno}`}
                    onClick={event => handleClick(event, `${file}:${lno}`)}
                    selected={selected.includes(`${file}:${lno}`)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={selected.includes(`${file}:${lno}`)}
                      />
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {file}
                    </TableCell>

                    <TableCell align="right">{lno}</TableCell>
                  </TableRow>
                ))
              )
              .flat()}
          </TableBody>
        </Table>
      </TableContainer>
    </aside>
  )
}
