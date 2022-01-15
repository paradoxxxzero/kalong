import { OpenInNew } from '@mui/icons-material'
import {
  Box,
  Chip,
  Link,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tabs,
} from '@mui/material'
import React, { useCallback, useState } from 'react'
import SwipeableViews from 'react-swipeable-views'
import Snippet from '../Snippet'
import ClassBases from './ClassBases'
import Inspectable from './Inspectable'
import Obj from './Obj'

export default function Inspect({ attributes, doc, source, infos }) {
  const [tab, setTab] = useState(0)
  const handleChange = useCallback((event, value) => setTab(value), [setTab])

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={handleChange}
        indicatorColor="secondary"
        textColor="secondary"
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="infos" value={0} />
        {Object.entries(attributes)
          .sort(() => 1)
          .map(([group], i) => (
            <Tab label={group} key={group} value={i + 1} />
          ))}
        {doc && (
          <Tab
            label="documentation"
            value={Object.keys(attributes).length + 1}
          />
        )}
        {source && (
          <Tab label="source" value={Object.keys(attributes).length + 2} />
        )}
      </Tabs>
      <SwipeableViews axis="x" index={tab} onChangeIndex={setTab}>
        <Box sx={{ maxHeight: '400px' }}>
          <Table>
            <TableBody>
              {infos.type ? (
                <TableRow>
                  <TableCell sx={{ wordBreak: 'normal' }} align="right">
                    Type
                  </TableCell>
                  <TableCell>
                    <Chip label={infos.type} sx={{ m: 0.5 }} />
                  </TableCell>
                </TableRow>
              ) : null}
              {infos.bases ? (
                <TableRow>
                  <TableCell sx={{ wordBreak: 'normal' }} align="right">
                    Bases
                  </TableCell>
                  <TableCell>
                    <ClassBases cls={infos.bases} root />
                  </TableCell>
                </TableRow>
              ) : null}
              {infos.mro ? (
                <TableRow>
                  <TableCell sx={{ wordBreak: 'normal' }} align="right">
                    MRO
                  </TableCell>
                  <TableCell>
                    {infos.mro.map(({ id, type }) => (
                      <Inspectable
                        key={type}
                        id={id}
                        type="chip"
                        label={type.trim()}
                        sx={{ m: 0.5 }}
                        color={
                          ['object', 'type'].includes(type)
                            ? void 0
                            : 'secondary'
                        }
                      />
                    ))}
                  </TableCell>
                </TableRow>
              ) : null}
              {infos.signature ? (
                <TableRow>
                  <TableCell sx={{ wordBreak: 'normal' }} align="right">
                    Signature
                  </TableCell>
                  <TableCell>
                    <Snippet value={infos.signature} />
                  </TableCell>
                </TableRow>
              ) : null}
              {infos.fqn ? (
                <TableRow>
                  <TableCell sx={{ wordBreak: 'normal' }} align="right">
                    Full Qualified Name
                  </TableCell>
                  <TableCell>{infos.fqn}</TableCell>
                </TableRow>
              ) : null}
              <TableRow>
                <TableCell sx={{ wordBreak: 'normal' }} align="right">
                  Identity
                </TableCell>
                <TableCell>
                  {infos.id} (0x{infos.id.toString(16)})
                </TableCell>
              </TableRow>
              {infos.online_doc ? (
                <TableRow>
                  <TableCell sx={{ wordBreak: 'normal' }} align="right">
                    Online documentation
                  </TableCell>
                  <TableCell>
                    <Link
                      href={infos.online_doc}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {infos.fqn || infos.type} <OpenInNew fontSize="small" />
                    </Link>
                  </TableCell>
                </TableRow>
              ) : null}
              {infos.file ? (
                <TableRow>
                  <TableCell sx={{ wordBreak: 'normal' }} align="right">
                    Declared in file
                  </TableCell>
                  <TableCell>
                    {infos.file}
                    {infos.source_size ? ` (${infos.source_size} lines)` : ''}
                  </TableCell>
                </TableRow>
              ) : null}
              {infos.comments ? (
                <TableRow>
                  <TableCell sx={{ wordBreak: 'normal' }} align="right">
                    Comments
                  </TableCell>
                  <TableCell>
                    <Snippet value={infos.comments} mode="text" />
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </Box>
        {Object.entries(attributes).map(([attr, values]) => (
          <Box key={attr} sx={{ maxHeight: '400px' }}>
            <Table>
              <TableBody>
                {values.map(({ key, value, id, signature }) => (
                  <TableRow key={key}>
                    <TableCell sx={{ wordBreak: 'normal' }} align="right">
                      {key}
                      <Box
                        component="span"
                        sx={theme => ({ color: theme.palette.text.secondary })}
                      >
                        {signature}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Obj value={value} id={id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        ))}
        <Box
          sx={{
            p: 3,
            fontSize: '.7em',
            maxHeight: '400px',
          }}
        >
          <Snippet value={doc} mode="text" />
        </Box>
        <Box
          sx={{
            p: 3,
            fontSize: '.9em',
            maxHeight: '400px',
          }}
        >
          <Snippet value={source} />
        </Box>
      </SwipeableViews>
    </Box>
  )
}
