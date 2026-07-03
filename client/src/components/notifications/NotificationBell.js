import React, { useState, useEffect, useCallback } from 'react';
import {
  IconButton, Badge, Popover, Box, Typography,
  List, ListItem, ListItemText, ListItemIcon,
  Button, Chip, Divider,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChatIcon from '@mui/icons-material/Chat';
import StarIcon from '@mui/icons-material/Star';
import EcoIcon from '@mui/icons-material/EnergySavingsLeaf';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const STORAGE_KEY = 'revora_notifications';

const ICON_MAP = {
  request_accepted:   <CheckCircleIcon sx={{ color: '#52b788' }} />,
  request_received:   <EcoIcon sx={{ color: '#f4a261' }} />,
  chat_message:       <ChatIcon sx={{ color: '#2196f3' }} />,
  rating_revealed:    <StarIcon sx={{ color: '#ffc107' }} />,
  request_completed:  <CheckCircleIcon sx={{ color: '#2d6a4f' }} />,
};

const loadNotifs = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveNotifs = (notifs) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs.slice(0, 30))); // keep last 30
};

/**
 * addNotification — call this from anywhere to push a notification
 * { type, title, body, path }
 */
export const addNotification = ({ type, title, body, path }) => {
  const current = loadNotifs();
  const notif = { id: Date.now(), type, title, body, path, read: false, createdAt: new Date().toISOString() };
  saveNotifs([notif, ...current]);
  // Dispatch custom event so open popover re-renders
  window.dispatchEvent(new CustomEvent('revora:notification', { detail: notif }));
};

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);
  const [notifs, setNotifs] = useState([]);

  const refresh = useCallback(() => setNotifs(loadNotifs()), []);

  useEffect(() => {
    refresh();
    window.addEventListener('revora:notification', refresh);
    // Poll every 30s for cross-tab updates
    const interval = setInterval(refresh, 30000);
    return () => {
      window.removeEventListener('revora:notification', refresh);
      clearInterval(interval);
    };
  }, [refresh]);

  if (!user) return null;

  const unread = notifs.filter((n) => !n.read).length;

  const markAllRead = () => {
    const updated = notifs.map((n) => ({ ...n, read: true }));
    saveNotifs(updated);
    setNotifs(updated);
  };

  const handleClick = (notif) => {
    const updated = notifs.map((n) => n.id === notif.id ? { ...n, read: true } : n);
    saveNotifs(updated);
    setNotifs(updated);
    setAnchor(null);
    if (notif.path) navigate(notif.path);
  };

  const clearAll = () => {
    saveNotifs([]);
    setNotifs([]);
  };

  const timeAgo = (iso) => {
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <>
      <IconButton
        onClick={(e) => { refresh(); setAnchor(e.currentTarget); }}
        sx={{ color: 'inherit' }}
        aria-label={`${unread} unread notifications`}
      >
        <Badge badgeContent={unread} color="error" max={9}>
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 340, borderRadius: 2, boxShadow: 6, mt: 1 } }}
      >
        {/* Header */}
        <Box sx={{ px: 2.5, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight={700}>Notifications</Typography>
            {unread > 0 && <Chip label={unread} size="small" color="error" sx={{ height: 20, fontSize: 11 }} />}
          </Box>
          <Box display="flex" gap={0.5}>
            {unread > 0 && (
              <Button size="small" onClick={markAllRead} sx={{ fontSize: 11 }}>Mark read</Button>
            )}
            {notifs.length > 0 && (
              <Button size="small" color="error" onClick={clearAll} sx={{ fontSize: 11 }}>Clear</Button>
            )}
          </Box>
        </Box>

        {/* List */}
        {notifs.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">No notifications yet</Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ maxHeight: 380, overflowY: 'auto' }}>
            {notifs.map((n, i) => (
              <React.Fragment key={n.id}>
                <ListItem
                  onClick={() => handleClick(n)}
                  sx={{
                    px: 2.5, py: 1.5,
                    cursor: 'pointer',
                    bgcolor: n.read ? 'transparent' : '#f0faf4',
                    '&:hover': { bgcolor: '#f5f5f5' },
                    alignItems: 'flex-start',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, mt: 0.3 }}>
                    {ICON_MAP[n.type] || <EcoIcon color="primary" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="body2" fontWeight={n.read ? 400 : 700} sx={{ flex: 1, pr: 1 }}>
                          {n.title}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" whiteSpace="nowrap">
                          {timeAgo(n.createdAt)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">{n.body}</Typography>
                    }
                  />
                </ListItem>
                {i < notifs.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}
