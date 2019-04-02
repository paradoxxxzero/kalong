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
export default class Mapping extends React.PureComponent {
  render() {
    const { classes, subtype, values, id } = this.props
    return (
      <>
        <Inspectable id={id}>
          <Snippet
            mode={null}
            value={subtype === 'dict' ? '{' : `${subtype}({`}
          />
        </Inspectable>
        {values.map(({ key, value }, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={i}>
            <AnswerDispatch {...key} />
            <span className={classnames(classes.buttonSize, classes.noWrap)}>
              :{' '}
            </span>
            <AnswerDispatch {...value} />
            {i + 1 !== values.length && (
              <span className={classnames(classes.buttonSize, classes.noWrap)}>
                ,{' '}
              </span>
            )}
          </React.Fragment>
        ))}
        <Inspectable id={id}>
          <Snippet mode={null} value={subtype === 'dict' ? '}' : '})'} />
        </Inspectable>
      </>
    )
  }
}
