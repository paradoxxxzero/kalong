import { IconButton, makeStyles } from '@material-ui/core'
import React, { useCallback, useState, useEffect } from 'react'
import UnfoldLessIcon from '@material-ui/icons/UnfoldLess'
import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import AnswerDispatch from './AnswerDispatch'
import Inspectable from './Inspectable'
import Snippet from '../Code/Snippet'

const useStyles = makeStyles(theme => ({
  noWrap: {
    whiteSpace: 'pre',
  },
  buttonSize: {
    fontSize: theme.typography.button.fontSize,
  },
  indented: {
    paddingLeft: '2em',
  },
  inline: {
    display: 'inline',
  },
  expandIcon: {
    fontSize: '16px',
  },
  expandButton: {
    padding: '4px',
  },
}))

export default function Iterable({ subtype, values, id }) {
  const classes = useStyles()
  const [expanded, setExpanded] = useState(false)
  const [folded, setFolded] = useState(false)

  const handleExpand = useCallback(() => setExpanded(x => !x), [])
  const handleFold = useCallback(() => setFolded(x => !x), [])
  useEffect(() => {
    setExpanded(values.length > 5)
  }, [values])

  const open = { list: '[', set: '{', tuple: '(' }[subtype]
  const close = { list: ']', set: '}', tuple: ')' }[subtype]

  return (
    <>
      <Inspectable id={id}>
        <Snippet mode={null} value={open || `${subtype}(`} />
      </Inspectable>
      {!!values.length && (
        <IconButton onClick={handleFold} className={classes.expandButton}>
          {folded ? (
            <UnfoldMoreIcon className={classes.expandIcon} />
          ) : (
            <UnfoldLessIcon className={classes.expandIcon} />
          )}
        </IconButton>
      )}
      {folded ? (
        '...'
      ) : (
        <section className={expanded ? classes.indented : classes.inline}>
          {values.map((props, i) => (
            <React.Fragment
              // eslint-disable-next-line react/no-array-index-key
              key={i}
            >
              <AnswerDispatch {...props} />
              {i + 1 !== values.length && (
                <Inspectable id={id}>
                  <Snippet mode={null} value=", " />
                </Inspectable>
              )}
              {expanded && <br />}
            </React.Fragment>
          ))}
        </section>
      )}
      <Inspectable id={id}>
        {values.length === 1 && open === '(' && (
          <Snippet mode={null} value="," />
        )}
        <Snippet mode={null} value={close || ')'} />
      </Inspectable>
      {!folded && (
        <IconButton onClick={handleExpand} className={classes.expandButton}>
          {expanded ? (
            <ExpandLessIcon className={classes.expandIcon} />
          ) : (
            <ExpandMoreIcon className={classes.expandIcon} />
          )}
        </IconButton>
      )}
    </>
  )
}
