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
  Pause,
  Redo,
} from '@material-ui/icons'
import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { doCommand } from './actions'
import { SkipNext } from '@material-ui/icons'
import { FastForward } from '@material-ui/icons'
import { Eject } from '@material-ui/icons'

const actions = running => [
  running
    ? {
        label: 'Pause the program',
        action: 'pause',
        Icon: Pause,
        key: 'F8',
        disabled: false,
      }
    : {
        label: 'Continue the program',
        action: 'continue',
        Icon: PlayArrow,
        key: 'F8',
        disabled: false,
      },
  {
    label: 'Step to the next instruction',
    action: 'step',
    Icon: ArrowForward,
    key: 'F9',
    disabled: running,
  },
  {
    label: 'Step Until next line (bypass loops)',
    action: 'stepUntil',
    Icon: Redo,
    key: 'F10',
    disabled: running,
  },
  {
    label: 'Step Into function call',
    action: 'stepInto',
    Icon: ArrowDownward,
    key: 'F11',
    disabled: running,
  },
  {
    label: 'Step Out of the current function',
    action: 'stepOut',
    Icon: ArrowUpward,
    key: 'Shift+F11',
    disabled: running,
  },
  {
    label: 'Trace the program (stop at every exception)',
    action: 'trace',
    Icon: SkipNext,
    key: 'Shift+F12',
    disabled: running,
  },
  {
    label: 'Run the program',
    action: 'run',
    Icon: FastForward,
    key: 'F12',
    disabled: running,
  },
  {
    label: 'StopDebugging',
    action: 'stop',
    Icon: Eject,
    key: 'Esc',
    disabled: running,
  },
  {
    label: 'Exit program',
    action: 'kill',
    Icon: Close,
    key: 'Shift+Esc',
    disabled: false,
  },
]

const useStyles = makeStyles({
  grow: {
    flexGrow: 1,
  },
})

const MobileItem = ({
  action: { label, action, disabled, Icon },
  handleCommand,
}) => (
  <MenuItem onClick={handleCommand} disabled={disabled} data-action={action}>
    <ListItemIcon>
      <Icon />
    </ListItemIcon>
    <Typography variant="inherit" noWrap>
      {label}
    </Typography>
  </MenuItem>
)

const ActionButton = ({
  action: { key, label, action, disabled, Icon },
  handleCommand,
}) => (
  <Tooltip title={`${label} [${key}]`}>
    <IconButton
      color="inherit"
      onClick={handleCommand}
      disabled={disabled}
      data-action={action}
    >
      <Icon />
    </IconButton>
  </Tooltip>
)
export default memo(function TopActions({ mobile }) {
  const title = useSelector(state => state.title)
  const frames = useSelector(state => state.frames)
  const running = useSelector(state => state.running)
  const dispatch = useDispatch()
  const classes = useStyles()
  const [menuEl, setMenuEl] = useState(null)
  const handleCommand = useCallback(
    evt => dispatch(doCommand(evt.currentTarget.getAttribute('data-action'))),
    [dispatch]
  )

  useEffect(() => {
    const handleGlobalActions = evt => {
      let { code } = evt
      if (evt.shiftKey) {
        code = `Shift+${code}`
      }
      const action = actions(running).find(({ key }) => code === key)
      if (!action) {
        return
      }
      handleCommand[action.action]()
      evt.preventDefault()
    }
    window.addEventListener('keydown', handleGlobalActions)
    return () => window.removeEventListener('keydown', handleGlobalActions)
  }, [running, handleCommand])

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

  const Action = mobile ? MobileItem : ActionButton
  const actionItems = actions(running).map(action => (
    <Action key={action.action} action={action} handleCommand={handleCommand} />
  ))

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
                {actionItems}
              </Menu>
            </>
          ) : (
            <div className={classes.steps}>{actionItems}</div>
          )}
        </>
      )}
    </>
  )
})
