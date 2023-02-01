import {
  ArrowForward,
  Close,
  Eject,
  FastForward,
  MoreHoriz,
  MoreVert,
  NorthEast,
  Pause,
  PlayArrow,
  Redo,
  SkipNext,
  South,
  SouthEast,
  TrendingDown,
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

const actions = (running, intoType, mobile, main) => [
  {
    label: 'Pause the program',
    action: 'pause',
    Icon: Pause,
    key: 'F8',
    disabled: false,
    hidden: !running || !main,
  },
  {
    label: 'Continue the program',
    action: 'continue',
    Icon: PlayArrow,
    key: 'F8',
    disabled: false,
    hidden: running,
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
    Icon: TrendingDown,
    key: 'F11',
    disabled: running,
    hidden: !mobile && intoType !== '',
    menu: 'stepInto',
  },
  {
    label: 'Step Into function call (all)',
    action: 'stepIntoAll',
    Icon: South,
    key: 'Ctrl+F11',
    disabled: running,
    hidden: !mobile && intoType !== 'all',
    menu: 'stepInto',
  },
  {
    label: 'Step Into function call (public only)',
    action: 'stepIntoPublic',
    Icon: SouthEast,
    key: 'Alt+F11',
    disabled: running,
    hidden: !mobile && intoType !== 'public',
    menu: 'stepInto',
  },
  {
    label: 'Step Out of the current function',
    action: 'stepOut',
    Icon: NorthEast,
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
]

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
  action: { key, label, action, disabled, menu, Icon },
  handleCommand,
  handleMenu,
}) => (
  <Tooltip title={`${label} [${key}]`}>
    <IconButton
      color="inherit"
      onClick={handleCommand}
      onContextMenu={menu && handleMenu}
      disabled={disabled}
      data-action={action}
      size="large"
    >
      <Icon />
      {menu && (
        <MoreHoriz
          fontSize="small"
          sx={{
            position: 'absolute',
            top: '1.5em',
            left: '1.75em',
            width: '0.6em',
          }}
        />
      )}
    </IconButton>
  </Tooltip>
)
export default (function TopActions({ mobile }) {
  const title = useSelector(state => state.title)
  const frames = useSelector(state => state.frames)
  const running = useSelector(state => state.running)
  const main = useSelector(state => state.main)
  const activeFrame = useSelector(state => state.activeFrame)
  const [intoType, setIntoType] = useState('')

  const dispatch = useDispatch()
  const [menuEl, setMenuEl] = useState(null)
  const handleCommand = useCallback(
    evt =>
      dispatch(
        doCommand(evt.currentTarget.getAttribute('data-action'), activeFrame)
      ),
    [activeFrame, dispatch]
  )
  const handleMenu = useCallback(evt => {
    setIntoType(intoType =>
      intoType === '' ? 'all' : intoType === 'all' ? 'public' : ''
    )
    evt.preventDefault()
  }, [])

  useEffect(() => {
    const handleGlobalActions = evt => {
      let { code } = evt
      if (evt.shiftKey) {
        code = `Shift+${code}`
      }
      if (evt.altKey) {
        code = `Alt+${code}`
      }
      if (evt.ctrlKey) {
        code = `Ctrl+${code}`
      }
      const action = actions(running).find(
        ({ key, visible, disabled }) => visible && !disabled && code === key
      )
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
  const actionItems = actions(running, intoType, mobile, main).map(
    action =>
      !action.hidden && (
        <Action
          key={action.action}
          action={action}
          handleCommand={handleCommand}
          handleMenu={handleMenu}
        />
      )
  )

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
