import {
  Chip,
  Link,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tabs,
  withStyles,
} from '@material-ui/core'
import { connect } from 'react-redux'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import React from 'react'
import SwipeableViews from 'react-swipeable-views'

import { requestInspect } from '../actions'
import { uid } from '../util'
import ClassBases from './ClassBases'
import Code from '../Code'
import Obj from './Obj'
import Snippet from '../Code/Snippet'

@connect(
  () => ({}),
  dispatch => ({
    inspect: (key, id) => dispatch(requestInspect(key, id)),
  })
)
@withStyles(theme => ({
  name: {
    wordBreak: 'normal',
  },
  doc: {
    padding: theme.spacing.unit * 3,
  },
  source: {
    padding: theme.spacing.unit * 3,
  },
  tabContent: {
    maxHeight: '400px',
    overflowY: 'auto',
  },
  type: {
    margin: '4px',
  },
  signature: {
    color: theme.palette.text.secondary,
  },
}))
export default class Inspect extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      tab: 0,
    }

    this.handleClick = this.handleClick.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  handleClick() {
    const { id, inspect } = this.props
    inspect(uid(), id)
  }

  handleChange(event, value) {
    this.setState({ tab: value })
  }

  render() {
    const { classes, attributes, doc, source, infos } = this.props
    const { tab } = this.state
    return (
      <div className={classes.root}>
        <Tabs
          value={tab}
          onChange={this.handleChange}
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
        <SwipeableViews
          axis="x"
          index={tab}
          onChangeIndex={i => this.setState({ tab: i })}
        >
          <div className={classes.tabContent}>
            <Table>
              <TableBody>
                {infos.type && (
                  <TableRow>
                    <TableCell className={classes.name} align="right">
                      Type
                    </TableCell>
                    <TableCell>
                      <Chip label={infos.type} className={classes.type} />
                    </TableCell>
                  </TableRow>
                )}
                {infos.bases && (
                  <TableRow>
                    <TableCell className={classes.name} align="right">
                      Bases
                    </TableCell>
                    <TableCell>
                      <ClassBases cls={infos.bases} root />
                    </TableCell>
                  </TableRow>
                )}
                {infos.mro && (
                  <TableRow>
                    <TableCell className={classes.name} align="right">
                      MRO
                    </TableCell>
                    <TableCell>
                      {infos.mro.map(type => (
                        <Chip
                          key={type}
                          className={classes.type}
                          label={type.trim()}
                          color={
                            ['object', 'type'].includes(type)
                              ? void 0
                              : 'secondary'
                          }
                        />
                      ))}
                    </TableCell>
                  </TableRow>
                )}
                {infos.signature && (
                  <TableRow>
                    <TableCell className={classes.name} align="right">
                      Signature
                    </TableCell>
                    <TableCell>
                      <Snippet value={infos.signature} />
                    </TableCell>
                  </TableRow>
                )}
                {infos.fqn && (
                  <TableRow>
                    <TableCell className={classes.name} align="right">
                      Full Qualified Name
                    </TableCell>
                    <TableCell>{infos.fqn}</TableCell>
                  </TableRow>
                )}
                {infos.online_doc && (
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
                        {infos.fqn} <OpenInNewIcon fontSize="small" />
                      </Link>
                    </TableCell>
                  </TableRow>
                )}
                {infos.file && (
                  <TableRow>
                    <TableCell className={classes.name} align="right">
                      Declared in file
                    </TableCell>
                    <TableCell>
                      {infos.file}
                      {infos.source_size ? ` (${infos.source_size} lines)` : ''}
                    </TableCell>
                  </TableRow>
                )}
                {infos.comments && (
                  <TableRow>
                    <TableCell className={classes.name} align="right">
                      Comments
                    </TableCell>
                    <TableCell>
                      <Snippet value={infos.comments} mode={null} />
                    </TableCell>
                  </TableRow>
                )}
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
          <div className={classes.tabContent}>
            <Code value={doc} mode={null} className={classes.doc} readOnly />
          </div>
          <div className={classes.tabContent}>
            <Code value={source} className={classes.source} readOnly />
          </div>
        </SwipeableViews>
      </div>
    )
  }
}
