import { withStyles } from '@material-ui/core'
import React from 'react'
import classnames from 'classnames'

import AnswerDispatch from './AnswerDispatch'
import Inspectable from './Inspectable'
import Snippet from '../Code/Snippet'

@withStyles(theme => ({
  noWrap: {
    whiteSpace: 'pre',
  },
  buttonSize: {
    fontSize: theme.typography.button.fontSize,
  },
}))
export default class Iterable extends React.PureComponent {
  render() {
    const { classes, subtype, values, id } = this.props
    const open = { list: '[', set: '{', tuple: '(' }[subtype]
    const close = { list: ']', set: '}', tuple: ')' }[subtype]
    return (
      <>
        <Inspectable id={id}>
          <Snippet mode={null} value={open || `${subtype}(`} />
        </Inspectable>
        {values.map((props, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={i}>
            <AnswerDispatch {...props} />
            {i + 1 !== values.length && (
              <span className={classnames(classes.buttonSize, classes.noWrap)}>
                ,{' '}
              </span>
            )}
          </React.Fragment>
        ))}
        <Inspectable id={id}>
          <Snippet mode={null} value={close || ')'} />
        </Inspectable>
      </>
    )
  }
}
