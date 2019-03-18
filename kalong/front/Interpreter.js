import React from 'react'

import Prompt from './Prompt'
import Scrollback from './Scrollback'

export default class Interpreter extends React.PureComponent {
  render() {
    return (
      <>
        <Scrollback />
        <Prompt />
      </>
    )
  }
}
