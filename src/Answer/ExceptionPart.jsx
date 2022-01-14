import {
  Divider,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
  makeStyles,
} from '@material-ui/core'
import React, { useCallback } from 'react'
import { Warning, ExpandMore } from '@material-ui/icons'

import Inspectable from './Inspectable'
import Snippet from '../Code/Snippet'

const useStyles = makeStyles(theme => ({
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

export default function Exception({
  id,
  name,
  description,
  subtype,
  traceback,
  expanded,
  i,
  onChange,
}) {
  const handleExpand = useCallback(() => {
    onChange(expanded ? null : i)
  }, [i, expanded, onChange])

  const classes = useStyles()

  return (
    <Accordion expanded={expanded} onChange={handleExpand}>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        className={classes.centered}
      >
        <Grid container direction="row" alignItems="center">
          <Typography className={classes.warn}>
            <Warning />
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
      </AccordionSummary>
      <Divider />
      <AccordionDetails>
        <List>
          {traceback.map((frame, n) => (
            <ListItem key={frame.key} divider={n !== traceback.length - 1}>
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
                    <Typography display="inline">{frame.lineNumber}</Typography>
                    <Typography display="inline" color="textSecondary">
                      {' '}
                      of{' '}
                    </Typography>
                    <Tooltip title={frame.absoluteFilename}>
                      <Typography display="inline">{frame.filename}</Typography>
                    </Tooltip>
                  </>
                }
                secondary={<Snippet value={frame.lineSource || '?'} />}
              />
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  )
}
