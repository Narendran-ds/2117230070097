import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material'
import DoneIcon from '@mui/icons-material/Done'
import WorkIcon from '@mui/icons-material/Work'
import EventIcon from '@mui/icons-material/Event'
import SchoolIcon from '@mui/icons-material/School'

export default function NotificationCard({ notification, index, typeColors, priorityMode, onMarkRead }) {
  const n = notification
  const color = typeColors[n.Type] || '#888'

  const iconMap = {
    Placement: <WorkIcon sx={{ fontSize: 16 }} />,
    Event: <EventIcon sx={{ fontSize: 16 }} />,
    Result: <SchoolIcon sx={{ fontSize: 16 }} />,
  }

  const formattedTime = n.Timestamp
    ? new Date(n.Timestamp).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : ''

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        p: 2.5,
        mb: 1,
        bgcolor: n.isRead ? 'transparent' : '#161616',
        border: '1px solid',
        borderColor: n.isRead ? '#1a1a1a' : '#252525',
        borderLeft: `3px solid ${n.isRead ? '#2a2a2a' : color}`,
        opacity: n.isRead ? 0.55 : 1,
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: color, opacity: 1 },
      }}
    >
      {/* Icon */}
      <Box sx={{
        width: 36, height: 36, flexShrink: 0,
        bgcolor: `${color}18`,
        border: `1px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: color,
      }}>
        {iconMap[n.Type] || null}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
          <Chip
            label={n.Type}
            size="small"
            sx={{
              bgcolor: `${color}20`,
              color: color,
              border: `1px solid ${color}40`,
              height: 20,
              fontSize: '0.68rem',
              fontFamily: '"Syne", sans-serif',
              fontWeight: 700,
            }}
          />
          {priorityMode && n._score !== undefined && (
            <Chip
              label={`Score: ${n._score.toFixed(3)}`}
              size="small"
              sx={{
                bgcolor: '#1a1a1a',
                color: '#888',
                height: 20,
                fontSize: '0.68rem',
                fontFamily: '"DM Sans", monospace',
              }}
            />
          )}
          {!n.isRead && (
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color, ml: 'auto' }} />
          )}
        </Box>

        <Typography
          sx={{
            fontSize: '0.95rem',
            color: n.isRead ? '#666' : '#f0ede6',
            lineHeight: 1.4,
            mb: 0.5,
          }}
        >
          {n.Message}
        </Typography>

        <Typography sx={{ fontSize: '0.75rem', color: '#555', fontFamily: '"DM Sans", monospace' }}>
          {formattedTime}
        </Typography>
      </Box>

      {/* Mark read button */}
      {!n.isRead && (
        <Tooltip title="Mark as read">
          <IconButton
            size="small"
            onClick={() => onMarkRead(n.ID)}
            sx={{
              color: '#555',
              flexShrink: 0,
              '&:hover': { color: color, bgcolor: `${color}15` },
            }}
          >
            <DoneIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  )
}
