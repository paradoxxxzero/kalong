import {
  ArrowDownward,
  ArrowForward,
  ArrowUpward,
  Close,
  Eject,
  FastForward,
  MoreVert,
  Pause,
  PlayArrow,
  Redo,
  SkipNext,
} from '@mui/icons-material'
import {
  Box,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material'
import Typography from '@mui/material/Typography'
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { doCommand } from './actions'

const actions = (running, main) =>
  [
    running
      ? main
        ? {
            label: 'Pause the program',
            action: 'pause',
            Icon: Pause,
            key: 'F8',
            disabled: false,
          }
        : null
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
      label: 'Stop debugging',
      action: 'stop',
      Icon: Eject,
      key: 'Escape',
      disabled: running,
    },
    {
      label: 'Exit program',
      action: 'kill',
      Icon: Close,
      key: 'Shift+Escape',
      disabled: false,
    },
  ].filter(x => x)

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
      size="large"
    >
      <Icon />
    </IconButton>
  </Tooltip>
)
export default (function TopActions({ mobile }) {
  const title = useSelector(state => state.title)
  const frames = useSelector(state => state.frames)
  const running = useSelector(state => state.running)
  const main = useSelector(state => state.main)
  const activeFrame = useSelector(state => state.activeFrame)

  const dispatch = useDispatch()
  const [menuEl, setMenuEl] = useState(null)
  const handleCommand = useCallback(
    evt =>
      dispatch(
        doCommand(evt.currentTarget.getAttribute('data-action'), activeFrame)
      ),
    [activeFrame, dispatch]
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
      dispatch(doCommand(action.action, activeFrame))
      evt.preventDefault()
    }
    window.addEventListener('keydown', handleGlobalActions)
    return () => window.removeEventListener('keydown', handleGlobalActions)
  }, [running, dispatch, activeFrame])

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
  const actionItems = actions(running, main).map(action => (
    <Action key={action.action} action={action} handleCommand={handleCommand} />
  ))

  return (
    <>
      <Typography variant="h6" color="inherit" noWrap>
        {title}
      </Typography>
      {!!frames.length && (
        <>
          <Box sx={{ flexGrow: 1 }} />
          {mobile ? (
            <>
              <IconButton onClick={openMenu} size="large">
                <MoreVert />
              </IconButton>
              <Menu anchorEl={menuEl} open={!!menuEl} onClose={closeMenu}>
                {actionItems}
              </Menu>
            </>
          ) : (
            <Box sx={{ whiteSpace: 'pre' }}>{actionItems}</Box>
          )}
        </>
      )}
    </>
  )
})
