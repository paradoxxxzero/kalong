import React from 'react'

export const CodeContext = React.createContext({ codeMirror: null })

// eslint-disable-next-line react/display-name
export const withContext = Component => props => (
  <CodeContext.Consumer>
    {({ codeMirror }) => <Component codeMirror={codeMirror} {...props} />}
  </CodeContext.Consumer>
)
