import {
  Paper,
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
import Obj from './Obj'
import Snippet from '../Code/Snippet'

@connect(
  () => ({}),
  dispatch => ({
    inspect: (key, id) => dispatch(requestInspect(key, id)),
  })
)
@withStyles(theme => ({
  inspect: {},
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
    const { classes, attributes, doc, source } = this.props
    const tab = this.state.tab || Object.keys(attributes)[0]
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
          {Object.entries(attributes).map(([group]) => (
            <Tab label={group} key={group} value={group} />
          ))}
          {doc && <Tab label="documentation" value="doc" />}
          {source && <Tab label="source" value="source" />}
        </Tabs>
        {!['doc', 'source'].includes(tab) && (
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
          <Typography component="div" className={classes.doc}>
            {doc}
          </Typography>
        )}
        {tab === 'source' && (
          <Typography component="div" className={classes.source}>
            <Snippet value={source} />
          </Typography>
        )}
      </div>
    )
  }
}
