import { Link } from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import React from 'react'
import Typography from '@mui/material/Typography'
import clsx from 'clsx'

import Frames from './Frames'

const drawerWidth = 240

const useStyles = makeStyles(theme => ({
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
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
  toolbar: {
    ...theme.mixins.toolbar,
    display: 'flex',
  },
  brand: {
    padding: theme.spacing(1),
    display: 'flex',
    alignItems: 'baseline',
    width: '100%',
    justifyContent: 'space-around',
  },
  egg: {
    transform: 'rotate3d(0, 1, 0, 0deg)',
    transition: 'transform 500ms',
    marginLeft: '-1px',
  },
  title: {
    fontSize: '3em',
    '&:hover $egg': {
      display: 'inline-block',
      transform: 'rotate3d(0, 1, 0, 180deg)',
      transformOrigin: 'center',
      textDecoration: 'underline',
    },
  },
  subtitle: {
    fontSize: '1.5em',
  },
}))

export default function SideDrawer({ rtl, open, mobile, onDrawerClose }) {
  const classes = useStyles()
  return (
    <Drawer
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: open,
        [classes.drawerClose]: !open,
      })}
      classes={{
        paper: clsx({
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        }),
      }}
      open={open}
      variant={mobile ? 'temporary' : 'persistent'}
      anchor={rtl ? 'right' : 'left'}
      onClose={onDrawerClose}
    >
      <div className={classes.toolbar}>
        <div className={classes.brand}>
          <Link href="http://github.com/paradoxxxzero/kalong/">
            <Typography variant="h1" className={classes.title}>
              Kal<span className={classes.egg}>o</span>ng
            </Typography>
          </Link>
          <Link href="http://github.com/paradoxxxzero/kalong/releases">
            <Typography variant="subtitle1" className={classes.subtitle}>
              v0.0.0
            </Typography>
          </Link>
        </div>
      </div>
      <Divider />
      <Frames />
    </Drawer>
  )
}
