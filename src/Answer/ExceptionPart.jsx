import ExpandMore from '@mui/icons-material/ExpandMore'
import Warning from '@mui/icons-material/Warning'
import Grid from '@mui/material/Grid2'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
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
  const color = subtype === 'internal' ? 'warning.main' : 'error.main'
  return (
    <Accordion
      expanded={expanded}
      onChange={handleExpand}
      elevation={0}
      disableGutters
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          alignItems: 'center',
          p: 0,
          color,
        }}
      >
        <Grid container direction="row" alignItems="center">
          <Inspectable id={id} type="icon" sx={{ pt: 0.6, color }}>
            <Warning />
          </Inspectable>
          {subtype !== 'root' && (
            <Typography color="textSecondary" sx={{ p: 1, pb: 0.5 }}>
              {subtype === 'internal'
                ? 'Internal kalong error:'
                : subtype === 'cause'
                  ? 'Caused by'
                  : 'Issued from'}
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
