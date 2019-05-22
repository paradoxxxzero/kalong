import { Tooltip, makeStyles } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward'
import IconButton from '@material-ui/core/IconButton'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import React, { useCallback, useLayoutEffect, useState, useMemo } from 'react'
import RedoIcon from '@material-ui/icons/Redo'
import StopIcon from '@material-ui/icons/Stop'
import Typography from '@material-ui/core/Typography'

import { doCommand } from './actions'

const actions = [
  {
    label: 'Step Into function call',
    action: 'stepInto',
    Icon: ArrowDownwardIcon,
  },
  {
    label: 'Step to the next instruction',
    action: 'step',
    Icon: ArrowForwardIcon,
  },
  {
    label: 'Step Out of the current function',
    action: 'stepOut',
    Icon: ArrowUpwardIcon,
  },
  {
    label: 'Step Until next line (bypass loops)',
    action: 'stepUntil',
    Icon: RedoIcon,
  },
  {
    label: 'Continue the program and stop at exceptions',
    action: 'continue',
    Icon: PlayArrowIcon,
  },
  {
    label: 'Stop debugging',
    action: 'stop',
    Icon: StopIcon,
  },
]

const useStyles = makeStyles({
  grow: {
    flexGrow: 1,
  },
  steps: {},
})

export default function TopActions({ mobile }) {
  const title = useSelector(state => state.title)
  const frames = useSelector(state => state.frames)
  const dispatch = useDispatch()
  const classes = useStyles()
  const [menuEl, setMenuEl] = useState(null)
  const handleCommand = useMemo(
    () =>
      actions.reduce((functions, { action }) => {
        functions[action] = () => dispatch(doCommand(action))
        return functions
      }, {}),
    [dispatch]
  )

  const closeMenu = useCallback(() => setMenuEl(null), [])
  const openMenu = useCallback(
    ({ currentTarget }) => setMenuEl(currentTarget),
    []
  )
  useLayoutEffect(() => {
    if (!mobile && menuEl) {
      closeMenu()
    }
  })

  return (
    <>
      <Typography variant="h6" color="inherit" noWrap>
        {title}
      </Typography>
      {!!frames.length && (
        <>
          <div className={classes.grow} />
          {mobile ? (
            <>
              <IconButton onClick={openMenu}>
                <MoreVertIcon />
              </IconButton>
              <Menu anchorEl={menuEl} open={!!menuEl} onClose={closeMenu}>
                {actions.map(({ label, action, Icon }) => (
                  <MenuItem key={action} onClick={handleCommand[action]}>
                    <ListItemIcon>
                      <Icon />
                    </ListItemIcon>
                    <Typography variant="inherit" noWrap>
                      {label}
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>
            </>
          ) : (
            <div className={classes.steps}>
              {actions.map(({ label, action, Icon }) => (
                <Tooltip key={action} title={label}>
                  <IconButton color="inherit" onClick={handleCommand[action]}>
                    <Icon />
                  </IconButton>
                </Tooltip>
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
