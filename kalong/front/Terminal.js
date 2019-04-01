import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  withStyles,
} from '@material-ui/core'
import { connect } from 'react-redux'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import React from 'react'

import { prettyTime } from './util'
import Answer from './Answer'
import Prompt from './Prompt'
import Snippet from './Code/Snippet'

@connect(state => ({
  scrollback: state.scrollback,
}))
@withStyles(() => ({
  scrollback: {
    flex: 1,
    overflowY: 'scroll',
    scrollBehavior: 'smooth',
  },
  element: {
    margin: '1em',
    display: 'flex',
    flexDirection: 'column',
  },
  prompt: {
    display: 'block',
    padding: '4px', // .CodeMirror pre padding and .CodeMirror-lines
  },
  content: {
    padding: '0 16px',
  },
}))
export default class Terminal extends React.PureComponent {
  constructor(props) {
    super(props)

    this.scroller = React.createRef()
  }

  componentDidUpdate() {
    this.scroller.current.scrollTop = this.scroller.current.scrollHeight
  }

  render() {
    const { classes, scrollback } = this.props
    return (
      <div className={classes.scrollback} ref={this.scroller}>
        {scrollback.map(({ key, prompt, answer, duration }) => (
          <Card key={key} className={classes.element}>
            <CardHeader
              avatar={<ChevronRightIcon fontSize="large" />}
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
              <CardContent className={classes.content}>
                <Typography variant="h6">
                  <Answer answer={answer} />
                </Typography>
              </CardContent>
            )}
          </Card>
        ))}
        <Prompt />
      </div>
    )
  }
}
