import {
  Chip,
  Link,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tabs,
  makeStyles,
} from '@material-ui/core'
import React, { useState, useCallback } from 'react'
import SwipeableViews from 'react-swipeable-views'
import clsx from 'clsx'
import { OpenInNew } from '@material-ui/icons'

import ClassBases from './ClassBases'
import Inspectable from './Inspectable'
import Obj from './Obj'
import Snippet from '../Code/Snippet'

const useStyles = makeStyles(theme => ({
  name: {
    wordBreak: 'normal',
  },
  doc: {
    padding: theme.spacing(3),
    fontSize: '.7em',
  },
  source: {
    padding: theme.spacing(3),
    fontSize: '.9em',
  },
  tabContent: {
    maxHeight: '400px',
  },
  type: {
    margin: '4px',
  },
  signature: {
    color: theme.palette.text.secondary,
  },
}))

export default function Inspect({ attributes, doc, source, infos }) {
  const classes = useStyles()
  const [tab, setTab] = useState(0)
  const handleChange = useCallback((event, value) => setTab(value), [setTab])

  return (
    <div className={classes.root}>
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
        <div className={classes.tabContent}>
          <Table>
            <TableBody>
              {infos.type ? (
                <TableRow>
                  <TableCell className={classes.name} align="right">
                    Type
                  </TableCell>
                  <TableCell>
                    <Chip label={infos.type} className={classes.type} />
                  </TableCell>
                </TableRow>
              ) : null}
              {infos.bases ? (
                <TableRow>
                  <TableCell className={classes.name} align="right">
                    Bases
                  </TableCell>
                  <TableCell>
                    <ClassBases cls={infos.bases} root />
                  </TableCell>
                </TableRow>
              ) : null}
              {infos.mro ? (
                <TableRow>
                  <TableCell className={classes.name} align="right">
                    MRO
                  </TableCell>
                  <TableCell>
                    {infos.mro.map(({ id, type }) => (
                      <Inspectable
                        key={type}
                        id={id}
                        type="chip"
                        label={type.trim()}
                        className={classes.type}
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
                  <TableCell className={classes.name} align="right">
                    Signature
                  </TableCell>
                  <TableCell>
                    <Snippet value={infos.signature} />
                  </TableCell>
                </TableRow>
              ) : null}
              {infos.fqn ? (
                <TableRow>
                  <TableCell className={classes.name} align="right">
                    Full Qualified Name
                  </TableCell>
                  <TableCell>{infos.fqn}</TableCell>
                </TableRow>
              ) : null}
              <TableRow>
                <TableCell className={classes.name} align="right">
                  Identity
                </TableCell>
                <TableCell>
                  {infos.id} (0x{infos.id.toString(16)})
                </TableCell>
              </TableRow>
              {infos.online_doc ? (
                <TableRow>
                  <TableCell className={classes.name} align="right">
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
                  <TableCell className={classes.name} align="right">
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
                  <TableCell className={classes.name} align="right">
                    Comments
                  </TableCell>
                  <TableCell>
                    <Snippet value={infos.comments} mode={null} />
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
        {Object.entries(attributes).map(([attr, values]) => (
          <div key={attr} className={classes.tabContent}>
            <Table>
              <TableBody>
                {values.map(({ key, value, id, signature }) => (
                  <TableRow key={key}>
                    <TableCell className={classes.name} align="right">
                      {key}
                      <span className={classes.signature}>{signature}</span>
                    </TableCell>
                    <TableCell>
                      <Obj value={value} id={id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
        <div className={clsx(classes.tabContent, classes.doc)}>
          <Snippet value={doc} mode={null} />
        </div>
        <div className={clsx(classes.tabContent, classes.source)}>
          <Snippet value={source} />
        </div>
      </SwipeableViews>
    </div>
  )
}
