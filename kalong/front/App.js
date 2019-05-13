import { withStyles } from '@material-ui/core/styles'
import { withWidth } from '@material-ui/core'
import CssBaseline from '@material-ui/core/CssBaseline'
import React from 'react'

import Main from './Main'
import SideDrawer from './SideDrawer'
import TopBar from './TopBar'

@withWidth()
@withStyles(
  () => ({
    root: {
      display: 'flex',
      width: '100vw',
      height: '100vh',
      justifyContent: 'center',
    },
    content: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0, // Fix codemirror wrapping
    },
    terminal: {
      flex: 1,
    },
    source: {
      flex: 1,
    },
  }),
  { withTheme: true }
)
export default class App extends React.PureComponent {
  static isMobile(width) {
    return ['xs', 'sm'].includes(width)
  }

  constructor(props) {
    super(props)
    this.state = {
      open: !App.isMobile(props.width),
    }
    this.handleDrawerOpen = this.handleDrawerOpen.bind(this)
    this.handleDrawerClose = this.handleDrawerClose.bind(this)
  }

  componentDidUpdate({ width: oldWidth }) {
    const { width } = this.props
    const oldMobile = App.isMobile(oldWidth)
    const mobile = App.isMobile(width)
    if (mobile !== oldMobile) {
      if (mobile) {
        this.handleDrawerClose()
      } else {
        this.handleDrawerOpen()
      }
    }
  }

  handleDrawerOpen() {
    this.setState({ open: true })
  }

  handleDrawerClose() {
    this.setState({ open: false })
  }

  render() {
    const { classes, theme, width } = this.props
    const { open } = this.state
    const mobile = ['xs', 'sm'].includes(width)
    return (
      <div className={classes.root}>
        <CssBaseline />
        <TopBar
          mobile={mobile}
          open={open}
          rtl={theme.direction === 'rtl'}
          onDrawerOpen={this.handleDrawerOpen}
          onDrawerClose={this.handleDrawerClose}
        />
        <SideDrawer
          mobile={mobile}
          open={open}
          rtl={theme.direction === 'rtl'}
          onDrawerClose={this.handleDrawerClose}
        />
        <Main />
      </div>
    )
  }
}
