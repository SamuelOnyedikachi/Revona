import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton,
  Box, Avatar, Menu, MenuItem, Chip, useScrollTrigger,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import EcoIcon from '@mui/icons-material/EnergySavingsLeaf';
import AddIcon from '@mui/icons-material/Add';
import MobileDrawer from './MobileDrawer';
import NotificationBell from '../notifications/NotificationBell';

const ROLE_COLOR = { vendor: 'warning', farmer: 'success', composter: 'info', admin: 'error' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const elevated = useScrollTrigger({ disableHysteresis: true, threshold: 10 });

  const handleLogout = () => { logout(); navigate('/'); setAnchor(null); };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={elevated ? 4 : 0}
        sx={{
          background: elevated ? 'rgba(27,67,50,0.97)' : 'linear-gradient(135deg,#1b4332,#2d6a4f)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
        }}
      >
        <Toolbar sx={{ maxWidth: 1200, mx: 'auto', width: '100%', px: { xs: 2, md: 3 } }}>
          {/* Mobile hamburger */}
          <IconButton color="inherit" sx={{ display: { md: 'none' }, mr: 1 }} onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', flexGrow: 1 }}>
            <EcoIcon sx={{ color: '#52b788', fontSize: 28 }} />
            <Typography variant="h5" sx={{ color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, letterSpacing: '-0.5px' }}>
              Re<span style={{ color: '#52b788' }}>Vora</span>
            </Typography>
          </Box>

          {/* Desktop nav links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, alignItems: 'center' }}>
            <Button color="inherit" component={Link} to="/listings" sx={{ opacity: 0.9 }}>Browse</Button>
            <Button color="inherit" component={Link} to="/impact" sx={{ opacity: 0.9 }}>Impact</Button>
            <Button color="inherit" component={Link} to="/learn" sx={{ opacity: 0.9 }}>Learn</Button>

            {user ? (
              <>
                <Button color="inherit" component={Link} to="/dashboard" sx={{ opacity: 0.9 }}>Dashboard</Button>
                <Button color="inherit" component={Link} to="/requests" sx={{ opacity: 0.9 }}>Requests</Button>
                {user.role === 'vendor' && (
                  <Button variant="outlined" component={Link} to="/listings/new" startIcon={<AddIcon />}
                    sx={{ borderColor: '#52b788', color: '#52b788', ml: 1, '&:hover': { borderColor: '#74c69d', bgcolor: 'rgba(82,183,136,0.1)' } }}>
                    Post
                  </Button>
                )}
                <NotificationBell />
                <Box onClick={(e) => setAnchor(e.currentTarget)} sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', ml: 0.5 }}>
                  <Chip label={user.role} size="small" color={ROLE_COLOR[user.role] || 'default'} sx={{ color: '#fff', fontWeight: 600 }} />
                  <Avatar src={user.avatar} sx={{ width: 36, height: 36, bgcolor: '#52b788', fontSize: 14 }}>{user.name?.[0]}</Avatar>
                </Box>
                <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} PaperProps={{ sx: { mt: 1, borderRadius: 2, minWidth: 180 } }}>
                  <MenuItem component={Link} to={`/profile/${user._id}`} onClick={() => setAnchor(null)}>My profile</MenuItem>
                  <MenuItem component={Link} to="/settings" onClick={() => setAnchor(null)}>Settings</MenuItem>
                  {user.role === 'admin' && <MenuItem component={Link} to="/admin" onClick={() => setAnchor(null)}>Admin panel</MenuItem>}
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontWeight: 600 }}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button variant="outlined" color="inherit" component={Link} to="/login" sx={{ borderColor: 'rgba(255,255,255,0.4)', ml: 1 }}>Log in</Button>
                <Button variant="contained" component={Link} to="/register" sx={{ bgcolor: '#52b788', '&:hover': { bgcolor: '#40916c' }, ml: 1 }}>Join free</Button>
              </>
            )}
          </Box>

          {/* Mobile: notification bell + post shortcut */}
          <Box sx={{ display: { md: 'none' }, display: 'flex', alignItems: 'center' }}>
            <NotificationBell />
            {user?.role === 'vendor' && (
              <IconButton component={Link} to="/listings/new" sx={{ color: '#52b788' }}><AddIcon /></IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
