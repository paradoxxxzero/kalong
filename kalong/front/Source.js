import { connect } from 'react-redux'
import { tinycolor } from '@thebespokepixel/es-tinycolor'
import { withStyles } from '@material-ui/core'
import React from 'react'
import blueGrey from '@material-ui/core/colors/blueGrey'
import classnames from 'classnames'
import equal from 'fast-deep-equal'

import { getFile } from './actions'
import { range } from './util'
import Code from './Code'

const cmBg = f => f(tinycolor(blueGrey[900])).toString()

@connect(
  state => ({
    frames: state.frames,
    files: state.files,
    activeFrame: state.activeFrame,
  }),
  dispatch => ({
    requestFile: filename => dispatch(getFile(filename)),
  })
)
@withStyles(() => ({
  source: {},
  context: {
    backgroundColor: cmBg(c => c.darken(2)),
    borderRight: `1px solid ${cmBg(c => c.darken(6))}`,
    borderLeft: `1px solid ${cmBg(c => c.darken(6))}`,
  },
  contextTop: {
    borderTop: `1px solid ${cmBg(c => c.darken(6))}`,
  },
  contextBottom: {
    borderBottom: `1px solid ${cmBg(c => c.darken(6))}`,
  },
  active: {
    backgroundColor: cmBg(c => c.lighten(5)),
  },
}))
export default class Source extends React.PureComponent {
  componentDidMount() {
    this.componentDidUpdate({})
  }

  componentDidUpdate(oldProps) {
    const { frames, files, requestFile, activeFrame } = this.props

    if (!equal(oldProps, this.props)) {
      const current = frames.find(({ key }) => activeFrame === key)

      if (current && current.filename && !files[current.filename]) {
        requestFile(current.filename)
      }
    }
  }

  render() {
    const { classes, className, frames, files, activeFrame } = this.props
    const current = frames.find(({ key }) => key === activeFrame)
    if (!current) {
      return null
    }
    const {
      filename,
      lineNumber,
      firstFunctionLineNumber,
      lastFunctionLineNumber,
    } = current
    if (!files[filename]) {
      return null
    }
    return (
      <Code
        className={classnames(classes.source, className)}
        readOnly
        lineNumbers
        lineWrapping
        theme="material"
        gutters={['CodeMirror-linemarkers', 'CodeMirror-linenumbers']}
        height="100%"
      >
        <Code.Source code={files[filename]} />
        {/* Active line */}
        <Code.Line line={lineNumber} classes={{ background: classes.active }} />
        <Code.Gutter
          line={lineNumber}
          gutter="CodeMirror-linemarkers"
          marker="➤"
        />
        {/* Context */}
        <Code.Line
          line={firstFunctionLineNumber}
          classes={{ background: classes.contextTop }}
        />
        {range(firstFunctionLineNumber, lastFunctionLineNumber + 1).map(
          line => (
            <Code.Line
              key={line}
              line={line}
              classes={{ background: classes.context }}
            />
          )
        )}
        <Code.Line
          line={lastFunctionLineNumber}
          classes={{ background: classes.contextBottom }}
        />
        <Code.InView line={lineNumber} />
      </Code>
    )
  }
}
