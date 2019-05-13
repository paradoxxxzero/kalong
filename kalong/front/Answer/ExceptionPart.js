import {
  Divider,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Grid,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
  withStyles,
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import React from 'react'
import WarningIcon from '@material-ui/icons/Warning'

import Inspectable from './Inspectable'
import Snippet from '../Code/Snippet'

@withStyles(theme => ({
  centered: {
    alignItems: 'center',
  },
  heading: {
    display: 'flex',
    alignItems: 'center',
  },
  cause: {
    padding: '8px 8px 0 0',
  },
  warn: {
    color: theme.palette.error.main,
    padding: '8px 8px 0 8px',
  },
  button: {
    paddingTop: '5px',
  },
}))
export default class Exception extends React.PureComponent {
  constructor(props) {
    super(props)

    this.handleExpand = this.handleExpand.bind(this)
  }

  handleExpand() {
    const { expanded, i, onChange } = this.props
    onChange(expanded ? null : i)
  }

  render() {
    const {
      classes,
      id,
      name,
      description,
      subtype,
      traceback,
      expanded,
    } = this.props

    return (
      <ExpansionPanel expanded={expanded} onChange={this.handleExpand}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          className={classes.centered}
        >
          <Grid container direction="row" alignItems="center">
            <Typography className={classes.warn}>
              <WarningIcon />
            </Typography>
            {subtype !== 'root' && (
              <Typography color="textSecondary" className={classes.cause}>
                {subtype === 'cause' ? 'Caused by' : 'Issued from'}
              </Typography>
            )}
            <Inspectable id={id} className={classes.button}>
              <Typography variant="h6">
                <Snippet value={name} mode={null} noBreakAll />
              </Typography>
              <Typography variant="subtitle1">
                <Snippet value={' ― '} mode={null} />
              </Typography>
              <Typography>
                <Snippet value={description} mode={null} />
              </Typography>
            </Inspectable>
          </Grid>
        </ExpansionPanelSummary>
        <Divider />
        <ExpansionPanelDetails>
          <List>
            {traceback.map((frame, i) => (
              <ListItem key={frame.key} divider={i !== traceback.length - 1}>
                <ListItemText
                  primary={
                    <>
                      <Typography display="inline" color="textSecondary">
                        {' '}
                        In{' '}
                      </Typography>
                      <Typography display="inline">{frame.function}</Typography>
                      <Typography display="inline" color="textSecondary">
                        {' '}
                        at line{' '}
                      </Typography>
                      <Typography display="inline">
                        {frame.lineNumber}
                      </Typography>
                      <Typography display="inline" color="textSecondary">
                        {' '}
                        of{' '}
                      </Typography>
                      <Tooltip title={frame.absoluteFilename}>
                        <Typography display="inline">
                          {frame.filename}
                        </Typography>
                      </Tooltip>
                    </>
                  }
                  secondary={<Snippet value={frame.lineSource || '?'} />}
                />
              </ListItem>
            ))}
          </List>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    )
  }
}
