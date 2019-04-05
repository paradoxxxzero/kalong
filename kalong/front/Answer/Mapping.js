import { IconButton, withStyles } from '@material-ui/core'
import React from 'react'
import UnfoldLessIcon from '@material-ui/icons/UnfoldLess'
import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore'

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
export default class Mapping extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      expanded: false,
    }

    this.handleExpand = this.handleExpand.bind(this)
  }

  static getDerivedStateFromProps({ values }, { _oldLength }) {
    if (values.length !== _oldLength) {
      return {
        expanded: values.length > 5,
        _oldLength: values.length,
      }
    }
  }

  handleExpand() {
    this.setState(({ expanded }) => ({ expanded: !expanded }))
  }

  render() {
    const { classes, subtype, values, id } = this.props
    const { expanded } = this.state
    return (
      <>
        <Inspectable id={id}>
          <Snippet
            mode={null}
            value={subtype === 'dict' ? '{' : `${subtype}({`}
          />
        </Inspectable>
        {!!values.length && (
          <IconButton
            onClick={this.handleExpand}
            className={classes.expandButton}
          >
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
}
