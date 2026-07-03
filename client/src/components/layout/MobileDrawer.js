import React, { useState } from 'react';
import {
  Drawer, Box, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Divider, Avatar,
  Typography, IconButton, Chip,
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import EcoIcon from '@mui/icons-material/EnergySavingsLeaf';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import SchoolIcon from '@mui/icons-material/School';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../context/AuthContext';

const ROLE_COLOR = { vendor: 'warning', farmer: 'success', composter: 'info', admin: 'error' };

const navItems = (user) => [
  { label: 'Home',        icon: <HomeIcon />,      path: '/',           always: true },
  { label: 'Browse',      icon: <SearchIcon />,    path: '/listings',   always: true },
  { label: 'Impact',      icon: <EcoIcon />,       path: '/impact',     always: true },
  { label: 'Learn',       icon: <SchoolIcon />,    path: '/learn',      always: true },
  ...(user ? [
    { label: 'Dashboard',  icon: <DashboardIcon />, path: '/dashboard' },
    { label: 'Requests',   icon: <ListAltIcon />,   path: '/requests' },
    ...(user.role === 'vendor' ? [
      { label: 'Post listing', icon: <AddCircleIcon />, path: '/listings/new', highlight: true },
    ] : []),
    { label: 'My profile', icon: <PersonIcon />,   path: `/profile/${user._id}` },
    ...(user.role === 'admin' ? [
      { label: 'Admin', icon: <AdminPanelSettingsIcon />, path: '/admin' },
    ] : []),
  ] : []),
];

/**
 * MobileDrawer
 * Props:
 *   open: boolean
 *   onClose: () => void
 */
export default function MobileDrawer({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  const items = navItems(user);

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 280,
          background: 'linear-gradient(180deg, #1b4332 0%, #2d6a4f 100%)',
          color: '#fff',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <EcoIcon sx={{ color: '#74c69d', fontSize: 28 }} />
          <Typography variant="h5" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight={800}>
            Re<span style={{ color: '#74c69d' }}>Vora</span>
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* User info */}
      {user && (
        <Box sx={{ px: 2.5, pb: 2 }}>
          <Box display="flex" alignItems="center" gap={1.5} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
            <Avatar src={user.avatar} sx={{ bgcolor: '#52b788', width: 42, height: 42 }}>
              {user.name?.[0]}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} noWrap>{user.name}</Typography>
              <Chip
                label={user.role}
                size="small"
                color={ROLE_COLOR[user.role] || 'default'}
                sx={{ height: 18, fontSize: 10, mt: 0.3 }}
              />
            </Box>
          </Box>
        </Box>
      )}

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />

      {/* Nav items */}
      <List sx={{ px: 1, py: 1, flexGrow: 1 }}>
        {items.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={onClose}
                sx={{
                  borderRadius: 2,
                  bgcolor: active
                    ? 'rgba(82,183,136,0.25)'
                    : item.highlight
                    ? 'rgba(244,162,97,0.2)'
                    : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
                  py: 1.2,
                }}
              >
                <ListItemIcon sx={{ color: active ? '#74c69d' : item.highlight ? '#f4a261' : 'rgba(255,255,255,0.75)', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 15,
                    fontWeight: active ? 700 : 500,
                    color: active ? '#74c69d' : '#fff',
                  }}
                />
                {item.highlight && (
                  <Chip label="New" size="small" sx={{ bgcolor: '#f4a261', color: '#fff', height: 18, fontSize: 10 }} />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />

      {/* Auth actions */}
      <Box sx={{ p: 2 }}>
        {user ? (
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: '#ffb3b3', '&:hover': { bgcolor: 'rgba(255,100,100,0.15)' } }}>
            <ListItemIcon sx={{ color: '#ffb3b3', minWidth: 40 }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        ) : (
          <Box display="flex" flexDirection="column" gap={1}>
            <ListItemButton component={Link} to="/login" onClick={onClose} sx={{ borderRadius: 2, border: '1px solid rgba(255,255,255,0.3)', justifyContent: 'center' }}>
              <Typography fontWeight={600}>Log in</Typography>
            </ListItemButton>
            <ListItemButton component={Link} to="/register" onClick={onClose} sx={{ borderRadius: 2, bgcolor: '#52b788', justifyContent: 'center', '&:hover': { bgcolor: '#40916c' } }}>
              <Typography fontWeight={700}>Join free</Typography>
            </ListItemButton>
          </Box>
        )}
      </Box>

      {/* SDG footer */}
      <Box sx={{ px: 2.5, pb: 2.5, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ opacity: 0.5, fontSize: 10 }}>
          Contributing to SDGs 2 · 11 · 12 · 13
        </Typography>
      </Box>
    </Drawer>
  );
}
