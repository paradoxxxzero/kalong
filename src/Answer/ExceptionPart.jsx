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
    <Accordion expanded={expanded} onChange={handleExpand}>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{ alignItems: 'center' }}
      >
        <Grid container direction="row" alignItems="center">
          <Typography
            sx={theme => ({
              color: theme.palette.error.main,
              padding: '8px 8px 0 8px',
            })}
          >
            <Warning />
          </Typography>
          {subtype !== 'root' && (
            <Typography color="textSecondary" sx={{ p: 1, pb: 0 }}>
              {subtype === 'cause' ? 'Caused by' : 'Issued from'}
            </Typography>
          )}
          <Inspectable id={id} sx={{ pt: 0.6 }}>
            <Typography variant="h6">
              <Snippet value={name} mode="text" noBreakAll />
            </Typography>
            <Typography variant="subtitle1">
              <Snippet value={' ― '} mode="text" />
            </Typography>
            <Typography>
              <Snippet value={description} mode="text" />
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
