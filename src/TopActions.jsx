import ArrowForward from '@mui/icons-material/ArrowForward'
import Close from '@mui/icons-material/Close'
import Eject from '@mui/icons-material/Eject'
import FastForward from '@mui/icons-material/FastForward'
import MoreHoriz from '@mui/icons-material/MoreHoriz'
import MoreVert from '@mui/icons-material/MoreVert'
import NorthEast from '@mui/icons-material/NorthEast'
import Pause from '@mui/icons-material/Pause'
import PlayArrow from '@mui/icons-material/PlayArrow'
import Redo from '@mui/icons-material/Redo'
import SkipNext from '@mui/icons-material/SkipNext'
import South from '@mui/icons-material/South'
import SouthEast from '@mui/icons-material/SouthEast'
import TrendingDown from '@mui/icons-material/TrendingDown'
import SlowMotionVideo from '@mui/icons-material/SlowMotionVideo'

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { doCommand } from './actions'
import { promptBus } from './Prompt'

const actions = (running, main, promptReady) => [
  {
    label: 'Pause the program',
    action: 'pause',
    Icon: Pause,
    key: 'F8',
    disabled: !running || !main,
    hidden: !running || !main,
  },
  {
    label: 'Continue the program',
    action: 'continue',
    Icon: PlayArrow,
    key: 'F8',
    disabled: running,
    hidden: running,
    menu: 'continue',
  },
  {
    label: 'Continue till condition',
    action: 'continueCondition',
    key: 'Alt+F8',
    Icon: SlowMotionVideo,
    disabled: running,
    hidden: running || !promptReady,
    menu: 'continue',
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
    menu: 'stepInto',
  },
  {
    label: 'Step Into function call (all)',
    action: 'stepIntoAll',
    Icon: South,
    key: 'Ctrl+F11',
    disabled: running,
    menu: 'stepInto',
  },
  {
    label: 'Step Into function call (public only)',
    action: 'stepIntoPublic',
    Icon: SouthEast,
    key: 'Alt+F11',
    disabled: running,
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
  action: { key, label, action, disabled, Icon },
  handleCommand,
  handleMenu,
}) => (
  <Tooltip title={`${label} [${key}]`}>
    <IconButton
      color="inherit"
      onClick={handleCommand}
      onContextMenu={handleMenu}
      disabled={disabled}
      data-action={action}
      size="large"
    >
      <Icon />
      {handleMenu && (
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
  const recursionLevel = useSelector(state => state.recursionLevel)

  const main = useSelector(state => state.main)
  const activeFrame = useSelector(state => state.activeFrame)
  const [menuItems, setMenuItems] = useState({
    stepInto: 'stepInto',
    continue: 'continue',
  })
  const [promptReady, setPromptReady] = useState(false)

  useEffect(() => {
    const promptStateHandler = ({ detail }) => {
      setPromptReady(detail.ready)
    }

    promptBus.addEventListener('state', promptStateHandler)
    return () => promptBus.removeEventListener('state', promptStateHandler)
  }, [])

  const currentActions = actions(running, main, promptReady)
  const menuActions = currentActions.reduce((acc, action) => {
    if (action.menu && !action.hidden) {
      if (!acc[action.menu]) {
        acc[action.menu] = []
      }
      acc[action.menu].push(action.action)
    }
    return acc
  }, {})

  useEffect(() => {
    const newMenuItems = {}
    Object.entries(menuActions).forEach(([menu, actions]) => {
      if (menuItems[menu] && !actions.includes(menuItems[menu])) {
        newMenuItems[menu] = actions[0]
      }
    })
    if (Object.keys(newMenuItems).length) {
      setMenuItems(menuItems => ({ ...menuItems, ...newMenuItems }))
    }
  }, [menuActions, menuItems])

  const dispatch = useDispatch()
  const [menuEl, setMenuEl] = useState(null)
  const handleCommand = useCallback(
    evt => {
      const action = evt.currentTarget.getAttribute('data-action')
      if (action === 'continueCondition') {
        // Delegate to the prompt
        promptBus.dispatchEvent(new CustomEvent('condition'))
      } else {
        dispatch(doCommand(action, activeFrame))
      }
    },
    [activeFrame, dispatch]
  )
  const nextMenuItem = (item, current) => {
    const typeTypes = menuActions[item]
    const currentIndex = typeTypes.findIndex(action => action === current)
    return typeTypes[(currentIndex + 1) % typeTypes.length]
  }

  const handleMenu = item => evt => {
    setMenuItems(menuItems => {
      return {
        ...menuItems,
        [item]: nextMenuItem(item, menuItems[item]),
      }
    })
    evt.preventDefault()
  }

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
        ({ key, disabled }) => !disabled && code === key
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
  const actionItems = currentActions.map(
    action =>
      !action.hidden &&
      (mobile || !action.menu || menuItems[action.menu] === action.action) && (
        <Action
          key={action.action}
          action={action}
          handleCommand={handleCommand}
          handleMenu={
            action.menu && menuActions[action.menu].length > 1
              ? handleMenu(action.menu)
              : undefined
          }
        />
      )
  )

  return (
    <>
      <Typography variant="h6" color="inherit" noWrap>
        {recursionLevel ? `${'('.repeat(recursionLevel)} ` : ''}
        {title}
        {recursionLevel ? ` ${')'.repeat(recursionLevel)}` : ''}
      </Typography>
      {!!frames.length && (
        <>
          <Box sx={{ flexGrow: 1 }} />
          {mobile ? (
            <>
              <IconButton onClick={openMenu} size="large">
                <MoreVert color="inherit" />
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
