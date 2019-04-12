import {
  Chip,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tabs,
  Typography,
  withStyles,
} from '@material-ui/core'
import { connect } from 'react-redux'
import React from 'react'

import { requestInspect } from '../actions'
import { uid } from '../util'
import ClassBases from './ClassBases'
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
  attributes: {
    maxHeight: '400px',
    overflowY: 'auto',
  },
  type: {
    margin: '4px',
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
    const tab = this.state.tab || 'infos'
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
          {infos && <Tab label="infos" value="infos" />}
          {Object.entries(attributes)
            .sort(() => 1)
            .map(([group]) => (
              <Tab label={group} key={group} value={group} />
            ))}
          {doc && <Tab label="documentation" value="doc" />}
          {source && <Tab label="source" value="source" />}
        </Tabs>
        {!['doc', 'source', 'infos'].includes(tab) && (
          <Typography component="div" className={classes.attributes}>
            <Table>
              <TableBody>
                {attributes[tab].map(({ key, value, id, signature }) => (
                  <TableRow key={key}>
                    <TableCell className={classes.name} align="right">
                      {key}
                      {signature}
                    </TableCell>
                    <TableCell>
                      <Obj value={value} id={id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Typography>
        )}
        {tab === 'doc' && (
          <Snippet value={doc} mode={null} className={classes.doc} />
        )}
        {tab === 'source' && (
          <Snippet value={source} className={classes.source} />
        )}
        {tab === 'infos' && (
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
        )}
      </div>
    )
  }
}
