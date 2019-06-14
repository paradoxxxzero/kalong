import { makeStyles } from '@material-ui/core'
import { tinycolor } from '@thebespokepixel/es-tinycolor'
import { useDispatch, useSelector } from 'react-redux'
import React, { useEffect } from 'react'
import blueGrey from '@material-ui/core/colors/blueGrey'
import classnames from 'classnames'

import { getFile } from './actions'
import { range } from './util'
import Code from './Code'
import CodeSource from './Code/Source'
import Gutter from './Code/Gutter'
import InView from './Code/InView'
import Line from './Code/Line'

const cmBg = f => f(tinycolor(blueGrey[900])).toString()

const useStyles = makeStyles({
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
})

export default function Source({ currentFile, className }) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const files = useSelector(state => state.files)
  const {
    absoluteFilename,
    lineNumber,
    firstFunctionLineNumber,
    lastFunctionLineNumber,
  } = currentFile
  useEffect(() => {
    if (absoluteFilename && !files[absoluteFilename]) {
      dispatch(getFile(absoluteFilename))
    }
  }, [dispatch, files, absoluteFilename])
  if (!files[absoluteFilename]) {
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
      <CodeSource code={files[absoluteFilename]} />
      {/* Active line */}
      <Line line={lineNumber} classes={{ background: classes.active }} />
      <Gutter line={lineNumber} gutter="CodeMirror-linemarkers" marker="➤" />
      {/* Context */}
      <Line
        line={firstFunctionLineNumber}
        classes={{ background: classes.contextTop }}
      />
      {range(firstFunctionLineNumber, lastFunctionLineNumber + 1).map(line => (
        <Line
          key={line}
          line={line}
          classes={{ background: classes.context }}
        />
      ))}
      <Line
        line={lastFunctionLineNumber}
        classes={{ background: classes.contextBottom }}
      />
      <InView line={lineNumber} />
    </Code>
  )
}
