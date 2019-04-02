import React from 'react'

import Inspectable from './Inspectable'
import Snippet from '../Code/Snippet'

export default class Obj extends React.PureComponent {
  render() {
    const { id, value } = this.props
    return (
      <Inspectable id={id}>
        <Snippet value={value} />
      </Inspectable>
    )
  }
}
