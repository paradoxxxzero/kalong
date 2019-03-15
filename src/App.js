import { CircularProgress, withWidth } from '@material-ui/core'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import CssBaseline from '@material-ui/core/CssBaseline'
import Divider from '@material-ui/core/Divider'
import Drawer from '@material-ui/core/Drawer'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import React, { Component } from 'react'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import classNames from 'classnames'

import Frames from './Frames'
import Interpreter from './Interpreter'
import Source from './Source'

const drawerWidth = 240

const styles = theme => ({
  root: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    justifyContent: 'center',
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: drawerWidth,
  },
  menuButton: {
    marginRight: 20,
  },
  toolbar: theme.mixins.toolbar,
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: 0,
  },
  content: {
    flexGrow: 1,
  },
  progress: {
    alignSelf: 'center',
  },
})

export default connect(state => ({
  title: state.title,
  connection: state.connection,
}))(
  withWidth()(
    withStyles(styles, { withTheme: true })(
      class App extends Component {
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
          const {
            classes,
            theme,
            container,
            width,
            title,
            connection,
          } = this.props
          const { open } = this.state
          const mobile = ['xs', 'sm'].includes(width)
          if (connection.state !== 'open') {
            return <CircularProgress className={classes.progress} />
          }
          return (
            <div className={classes.root}>
              <CssBaseline />
              <AppBar
                position="fixed"
                className={classNames(classes.appBar, {
                  [classes.appBarShift]: open && !mobile,
                })}
              >
                <Toolbar>
                  <IconButton
                    color="inherit"
                    onClick={
                      open ? this.handleDrawerClose : this.handleDrawerOpen
                    }
                    className={classes.menuButton}
                  >
                    {!mobile && open ? (
                      theme.direction === 'rtl' ? (
                        <ChevronRightIcon />
                      ) : (
                        <ChevronLeftIcon />
                      )
                    ) : (
                      <MenuIcon />
                    )}
                  </IconButton>
                  <Typography variant="h6" color="inherit" noWrap>
                    {title}
                  </Typography>
                </Toolbar>
              </AppBar>
              <Drawer
                className={classNames(classes.drawer, {
                  [classes.drawerOpen]: this.state.open,
                  [classes.drawerClose]: !this.state.open,
                })}
                classes={{
                  paper: classNames({
                    [classes.drawerOpen]: this.state.open,
                    [classes.drawerClose]: !this.state.open,
                  }),
                }}
                container={mobile ? container : void 0}
                variant={mobile ? 'temporary' : 'persistent'}
                anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                open={open}
                onClose={this.handleDrawerClose}
              >
                <div className={classes.toolbar}>
                  <Typography variant="h2" color="inherit" align="center">
                    Kalong
                  </Typography>
                </div>
                <Divider />
                <Frames />
              </Drawer>
              <main className={classes.content}>
                <div className={classes.toolbar} />
                <Source />
                <Interpreter />
              </main>
            </div>
          )
        }
      }
    )
  )
)
