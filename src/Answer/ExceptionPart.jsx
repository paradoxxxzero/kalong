import { ExpandMore, Warning } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material'
import { red } from '@mui/material/colors'
import React, { useCallback } from 'react'
import Snippet from '../Snippet'
import Inspectable from './Inspectable'

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

  return (
    <Accordion
      expanded={expanded}
      onChange={handleExpand}
      elevation={0}
      disableGutters
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{ alignItems: 'center', p: 0, color: 'error.main' }}
      >
        <Grid container direction="row" alignItems="center">
          <Inspectable
            id={id}
            type="icon"
            sx={{ pt: 0.6, color: 'error.main' }}
          >
            <Warning />
          </Inspectable>
          {subtype !== 'root' && (
            <Typography color="textSecondary" sx={{ p: 1, pb: 0 }}>
              {subtype === 'cause' ? 'Caused by' : 'Issued from'}
            </Typography>
          )}
          <Typography variant="h6" component="span">
            <Snippet value={name} mode="text" />
          </Typography>
          <Typography variant="subtitle1" component="span">
            <Snippet value={' ― '} mode="text" />
          </Typography>
          <Typography component="span">
            <Snippet value={description} mode="text" />
          </Typography>
        </Grid>
      </AccordionSummary>
      <Divider />
      <AccordionDetails sx={{ p: 0 }}>
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
