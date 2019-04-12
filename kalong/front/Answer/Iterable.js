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
    display: 'block',
    paddingLeft: '8px',
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
export default class Iterable extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      expanded: false,
      _oldLength: null,
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
    return null
  }

  handleExpand() {
    this.setState(({ expanded }) => ({ expanded: !expanded }))
  }

  render() {
    const { classes, subtype, values, id } = this.props
    const { expanded } = this.state
    const open = { list: '[', set: '{', tuple: '(' }[subtype]
    const close = { list: ']', set: '}', tuple: ')' }[subtype]
    return (
      <>
        <Inspectable id={id}>
          <Snippet mode={null} value={open || `${subtype}(`} />
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
        {values.map((props, i) => (
          <section
            className={expanded ? classes.indented : classes.inline}
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
          </section>
        ))}
        <Inspectable id={id}>
          {values.length === 1 && open === '(' && (
            <Snippet mode={null} value="," />
          )}
          <Snippet mode={null} value={close || ')'} />
        </Inspectable>
      </>
    )
  }
}
