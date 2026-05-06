import { useState, useEffect, useMemo } from 'react'
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  Badge,
  IconButton,
  Tooltip,
  Divider,
  Snackbar,
} from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import WorkIcon from '@mui/icons-material/Work'
import EventIcon from '@mui/icons-material/Event'
import SchoolIcon from '@mui/icons-material/School'
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead'
import RefreshIcon from '@mui/icons-material/Refresh'
import FilterListIcon from '@mui/icons-material/FilterList'
import NotificationCard from './components/NotificationCard.jsx'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#f0c040' },
    background: { default: '#0d0d0d', paper: '#161616' },
    text: { primary: '#f0ede6', secondary: '#888' },
  },
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    h4: { fontFamily: '"Syne", sans-serif', fontWeight: 800 },
    h6: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 2, textTransform: 'none', fontFamily: '"Syne", sans-serif', fontWeight: 600 },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 2, fontFamily: '"Syne", sans-serif', fontWeight: 600, fontSize: '0.75rem' },
      },
    },
  },
})

const TYPE_WEIGHT = { Placement: 3, Result: 2, Event: 1 }

function getPriorityScore(notification, oldestTs, now) {
  const weight = TYPE_WEIGHT[notification.Type] || 0
  const notifTime = new Date(notification.Timestamp).getTime()
  const recency = (notifTime - oldestTs) / (now - oldestTs)
  return weight + recency
}

const FILTERS = ['All', 'Placement', 'Event', 'Result']

export default function App() {
  const [token, setToken] = useState('')
  const [tokenInput, setTokenInput] = useState('')
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')
  const [snackbar, setSnackbar] = useState('')
  const [priorityMode, setPriorityMode] = useState(false)

  const API_BASE = 'http://20.207.122.201/evaluation-service'

  async function fetchNotifications(tkn) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${tkn}` },
      })
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
      const data = await res.json()
      const list = data.notifications || []
      setNotifications(list.map(n => ({ ...n, isRead: false })))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleConnect() {
    const t = tokenInput.trim()
    if (!t) return
    setToken(t)
    fetchNotifications(t)
  }

  function handleMarkRead(id) {
    setNotifications(prev => prev.map(n => n.ID === id ? { ...n, isRead: true } : n))
    setSnackbar('Marked as read')
  }

  function handleMarkAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setSnackbar('All marked as read')
  }

  const displayed = useMemo(() => {
    let list = filter === 'All' ? notifications : notifications.filter(n => n.Type === filter)

    if (priorityMode && list.length > 0) {
      const now = Date.now()
      const oldest = Math.min(...list.map(n => new Date(n.Timestamp).getTime()))
      list = [...list]
        .map(n => ({ ...n, _score: getPriorityScore(n, oldest, now) }))
        .sort((a, b) => b._score - a._score)
        .slice(0, 10)
    }

    return list
  }, [notifications, filter, priorityMode])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const typeColors = { Placement: '#f0c040', Event: '#4fc3f7', Result: '#a5d6a7' }
  const typeIcons = {
    Placement: <WorkIcon fontSize="small" />,
    Event: <EventIcon fontSize="small" />,
    Result: <SchoolIcon fontSize="small" />,
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', fontFamily: '"DM Sans", sans-serif' }}>

        {/* Header */}
        <Box sx={{
          borderBottom: '1px solid #222',
          px: { xs: 2, md: 6 },
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          bgcolor: '#0d0d0d',
          zIndex: 100,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 36, height: 36, bgcolor: '#f0c040',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <NotificationsIcon sx={{ color: '#0d0d0d', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ letterSpacing: '-0.5px' }}>
              Campus Notify
            </Typography>
          </Box>
          {token && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Badge badgeContent={unreadCount} color="primary" max={99}>
                <NotificationsIcon sx={{ color: '#888' }} />
              </Badge>
              <Typography variant="body2" sx={{ color: '#888', ml: 1 }}>
                {unreadCount} unread
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ maxWidth: 860, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>

          {/* Token Input */}
          {!token ? (
            <Box sx={{ mt: 8, mb: 4 }}>
              <Typography variant="h4" sx={{ mb: 1, letterSpacing: '-1px' }}>
                Connect your account
              </Typography>
              <Typography sx={{ color: '#888', mb: 4, fontSize: '0.95rem' }}>
                Paste your Bearer token from the auth endpoint to load your notifications.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  placeholder="Paste access_token here..."
                  value={tokenInput}
                  onChange={e => setTokenInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleConnect()}
                  size="small"
                  sx={{ bgcolor: '#161616' }}
                />
                <Button
                  variant="contained"
                  onClick={handleConnect}
                  sx={{ bgcolor: '#f0c040', color: '#0d0d0d', whiteSpace: 'nowrap', px: 3, '&:hover': { bgcolor: '#d4aa30' } }}
                >
                  Load Notifications
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              {/* Controls bar */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" sx={{ letterSpacing: '-1px' }}>
                  Inbox
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Refresh">
                    <IconButton onClick={() => fetchNotifications(token)} size="small" sx={{ border: '1px solid #222', borderRadius: 1 }}>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Mark all as read">
                    <IconButton onClick={handleMarkAllRead} size="small" sx={{ border: '1px solid #222', borderRadius: 1 }}>
                      <MarkEmailReadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Button
                    size="small"
                    onClick={() => setToken('')}
                    sx={{ border: '1px solid #222', color: '#888', px: 2 }}
                  >
                    Change Token
                  </Button>
                </Box>
              </Box>

              {/* Filter + Priority row */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {FILTERS.map(f => (
                    <Chip
                      key={f}
                      label={f}
                      onClick={() => setFilter(f)}
                      variant={filter === f ? 'filled' : 'outlined'}
                      sx={{
                        bgcolor: filter === f ? (typeColors[f] || '#f0c040') : 'transparent',
                        color: filter === f ? '#0d0d0d' : '#888',
                        borderColor: typeColors[f] || '#f0c040',
                        cursor: 'pointer',
                      }}
                      icon={f !== 'All' ? <span style={{ color: filter === f ? '#0d0d0d' : typeColors[f] }}>{typeIcons[f]}</span> : <FilterListIcon fontSize="small" />}
                    />
                  ))}
                </Box>
                <Button
                  size="small"
                  onClick={() => setPriorityMode(p => !p)}
                  variant={priorityMode ? 'contained' : 'outlined'}
                  sx={{
                    bgcolor: priorityMode ? '#f0c040' : 'transparent',
                    color: priorityMode ? '#0d0d0d' : '#f0c040',
                    borderColor: '#f0c040',
                    '&:hover': { bgcolor: priorityMode ? '#d4aa30' : 'rgba(240,192,64,0.08)' },
                  }}
                >
                  {priorityMode ? 'Priority: ON (Top 10)' : 'Priority Mode'}
                </Button>
              </Box>

              {/* Stats row */}
              {notifications.length > 0 && (
                <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                  {['Placement', 'Event', 'Result'].map(type => {
                    const count = notifications.filter(n => n.Type === type).length
                    return (
                      <Box key={type} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, bgcolor: typeColors[type] }} />
                        <Typography variant="body2" sx={{ color: '#888' }}>
                          {type}: <span style={{ color: typeColors[type], fontWeight: 600 }}>{count}</span>
                        </Typography>
                      </Box>
                    )
                  })}
                  <Divider orientation="vertical" flexItem sx={{ borderColor: '#222' }} />
                  <Typography variant="body2" sx={{ color: '#888' }}>
                    Total: <span style={{ color: '#f0ede6', fontWeight: 600 }}>{notifications.length}</span>
                  </Typography>
                </Box>
              )}

              {/* Error */}
              {error && (
                <Alert severity="error" sx={{ mb: 3, bgcolor: '#1a0a0a', border: '1px solid #5c1a1a' }} onClose={() => setError('')}>
                  {error} — Your token may have expired. Click &quot;Change Token&quot; to refresh.
                </Alert>
              )}

              {/* Loading */}
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress sx={{ color: '#f0c040' }} />
                </Box>
              )}

              {/* Notification list */}
              {!loading && displayed.length === 0 && !error && (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                  <NotificationsIcon sx={{ fontSize: 48, color: '#333', mb: 2 }} />
                  <Typography sx={{ color: '#555' }}>No notifications found</Typography>
                </Box>
              )}

              {!loading && displayed.map((n, i) => (
                <NotificationCard
                  key={n.ID}
                  notification={n}
                  index={i}
                  typeColors={typeColors}
                  typeIcons={typeIcons}
                  priorityMode={priorityMode}
                  onMarkRead={handleMarkRead}
                />
              ))}
            </>
          )}
        </Box>

        {/* Snackbar */}
        <Snackbar
          open={!!snackbar}
          autoHideDuration={2000}
          onClose={() => setSnackbar('')}
          message={snackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Box>
    </ThemeProvider>
  )
}
