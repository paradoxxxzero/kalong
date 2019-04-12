import React from 'react'

import ExceptionPart from './ExceptionPart'

export default class Exception extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      expanded: 0,
    }

    this.handleExpand = this.handleExpand.bind(this)
  }

  handleExpand(expanded) {
    this.setState({ expanded })
  }

  render() {
    const { causes, ...props } = this.props
    const { expanded } = this.state

    const exceptions = [props, ...(causes || [])]
    return (
      <>
        {exceptions.map((exc, i) => (
          <ExceptionPart
            key={exc.id}
            i={i}
            expanded={expanded === i}
            onChange={this.handleExpand}
            {...exc}
          />
        ))}
      </>
    )
  }
}
