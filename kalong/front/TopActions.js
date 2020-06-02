import {
  IconButton,
  ListItemIcon,
  makeStyles,
  Menu,
  MenuItem,
  Tooltip,
} from '@material-ui/core'
import Typography from '@material-ui/core/Typography'
import {
  ArrowDownward,
  ArrowForward,
  ArrowUpward,
  Close,
  MoreVert,
  PlayArrow,
  Redo,
  SkipNext,
} from '@material-ui/icons'
import React, {
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { doCommand, setPrompt } from './actions'
import { uid } from './util'

const actions = [
  {
    label: 'Step Into function call',
    action: 'stepInto',
    Icon: ArrowDownward,
  },
  {
    label: 'Step to the next instruction',
    action: 'step',
    Icon: ArrowForward,
  },
  {
    label: 'Step Out of the current function',
    action: 'stepOut',
    Icon: ArrowUpward,
  },
  {
    label: 'Step Until next line (bypass loops)',
    action: 'stepUntil',
    Icon: Redo,
  },
  {
    label: 'Continue the program and stop at exceptions',
    action: 'continue',
    Icon: SkipNext,
  },
  {
    label: 'Continue the program',
    action: 'stop',
    Icon: PlayArrow,
  },
  {
    action: 'kill',
    label: 'Close program',
    Icon: Close,
  },
]

const useStyles = makeStyles({
  grow: {
    flexGrow: 1,
  },
  steps: {},
})

export default memo(function TopActions({ mobile }) {
  const title = useSelector(state => state.title)
  const frames = useSelector(state => state.frames)
  const dispatch = useDispatch()
  const classes = useStyles()
  const [menuEl, setMenuEl] = useState(null)
  const handleCommand = useMemo(
    () =>
      actions.reduce((functions, { action }) => {
        functions[action] =
          action === 'kill'
            ? () => dispatch(setPrompt(uid(), 'import sys; sys.exit(1)'))
            : () => dispatch(doCommand(action))
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
                <MoreVert />
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
})
