import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Typography,
  withStyles,
} from '@material-ui/core'
import { connect } from 'react-redux'
import CloseIcon from '@material-ui/icons/Close'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import React from 'react'
import classnames from 'classnames'

import { prettyTime } from '../util'
import { removePromptAnswer } from '../actions'
import AnswerDispatch from './AnswerDispatch'
import Snippet from '../Code/Snippet'

@connect(
  () => ({}),
  dispatch => ({
    remove: key => dispatch(removePromptAnswer(key)),
  })
)
@withStyles(theme => ({
  answer: {
    minWidth: 0,
    padding: '0 16px',
    flex: 1,
  },
  prompt: {
    display: 'block',
    padding: '4px', // .CodeMirror pre padding and .CodeMirror-lines
  },
  element: {
    margin: '1em',
    display: 'flex',
    flexDirection: 'column',
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  content: {
    display: 'flex',
  },
}))
export default class Answer extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      expanded: true,
    }

    this.handleExpand = this.handleExpand.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  handleExpand() {
    this.setState(({ expanded }) => ({ expanded: !expanded }))
  }

  handleClose() {
    const { uid, remove } = this.props
    remove(uid)
  }

  render() {
    const { classes, answer, duration, prompt, command } = this.props
    return (
      <Card className={classes.element}>
        <CardHeader
          avatar={
            <>
              <IconButton
                className={classnames(classes.expand, {
                  [classes.expandOpen]: this.state.expanded,
                })}
                onClick={this.handleExpand}
              >
                <ExpandMoreIcon />
              </IconButton>
              {command && <Chip label={command} />}
            </>
          }
          title={<Snippet className={classes.prompt} value={prompt} />}
          titleTypographyProps={{ variant: 'h5' }}
          action={
            <IconButton onClick={this.handleClose}>
              <CloseIcon />
            </IconButton>
          }
        />
        {!!(answer && answer.length) && (
          <>
            <Divider />
            <Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
              <CardContent className={classes.content}>
                <Typography variant="h6" className={classes.answer}>
                  {answer.map((props, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <AnswerDispatch key={i} {...props} />
                  ))}
                </Typography>
                {duration && (
                  <Snippet
                    className={classes.duration}
                    value={prettyTime(duration)}
                    noBreakAll
                  />
                )}
              </CardContent>
            </Collapse>
          </>
        )}
      </Card>
    )
  }
}
