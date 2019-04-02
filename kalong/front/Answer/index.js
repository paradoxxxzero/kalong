import {
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Divider,
  IconButton,
  Typography,
  withStyles,
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import React from 'react'
import classnames from 'classnames'

import { prettyTime } from '../util'
import AnswerDispatch from './AnswerDispatch'
import Snippet from '../Code/Snippet'

@withStyles(theme => ({
  answer: {
    padding: '0 16px',
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
  duration: {
    display: 'block',
    padding: 12,
  },
}))
export default class Answer extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      expanded: true,
    }

    this.handleExpand = this.handleExpand.bind(this)
  }

  handleExpand() {
    this.setState(({ expanded }) => ({ expanded: !expanded }))
  }

  render() {
    const { classes, answer, duration, prompt } = this.props
    return (
      <Card className={classes.element}>
        <CardHeader
          avatar={
            <IconButton
              className={classnames(classes.expand, {
                [classes.expandOpen]: this.state.expanded,
              })}
              onClick={this.handleExpand}
            >
              <ExpandMoreIcon />
            </IconButton>
          }
          title={<Snippet className={classes.prompt} value={prompt} />}
          titleTypographyProps={{ variant: 'h5' }}
          action={
            duration && (
              <Snippet
                className={classes.duration}
                value={prettyTime(duration)}
              />
            )
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
              </CardContent>
            </Collapse>
          </>
        )}
      </Card>
    )
  }
}
