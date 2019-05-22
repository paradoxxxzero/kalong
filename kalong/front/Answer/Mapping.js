import { IconButton, makeStyles } from '@material-ui/core'
import React, { useCallback, useState, useEffect } from 'react'
import UnfoldLessIcon from '@material-ui/icons/UnfoldLess'
import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore'

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
    marginLeft: '8px',
  },
  expandIcon: {
    fontSize: '16px',
  },
  expandButton: {
    padding: '4px',
  },
}))

export default function Mapping({ subtype, values, id }) {
  const classes = useStyles()
  const [expanded, setExpanded] = useState(false)

  const handleExpand = useCallback(() => setExpanded(x => !x), [])
  useEffect(
    () => {
      setExpanded(values.length > 5)
    },
    [values]
  )

  return (
    <>
      <Inspectable id={id}>
        <Snippet
          mode={null}
          value={subtype === 'dict' ? '{' : `${subtype}({`}
        />
      </Inspectable>
      {!!values.length && (
        <IconButton onClick={handleExpand} className={classes.expandButton}>
          {expanded ? (
            <UnfoldLessIcon className={classes.expandIcon} />
          ) : (
            <UnfoldMoreIcon className={classes.expandIcon} />
          )}
        </IconButton>
      )}
      {expanded && <br />}
      {values.map(({ key, value }, i) => (
        <React.Fragment
          // eslint-disable-next-line react/no-array-index-key
          key={i}
        >
          <AnswerDispatch {...key} />
          <Inspectable id={id}>
            <Snippet mode={null} value=": " />
          </Inspectable>
          <AnswerDispatch {...value} />
          {i + 1 !== values.length && (
            <Inspectable id={id}>
              <Snippet mode={null} value=", " />
            </Inspectable>
          )}
          {expanded && <br />}
        </React.Fragment>
      ))}
      <Inspectable id={id}>
        <Snippet mode={null} value={subtype === 'dict' ? '}' : '})'} />
      </Inspectable>
    </>
  )
}
