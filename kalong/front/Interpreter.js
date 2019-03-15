import React, { Component } from 'react'

import Prompt from './Prompt'
import Scrollback from './Scrollback'

export default class Interpreter extends Component {
  render() {
    return (
      <>
        <Scrollback />
        <Prompt />
      </>
    )
  }
}
