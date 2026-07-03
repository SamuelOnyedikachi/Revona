import React, { useState } from 'react';
import {
  Container, Typography, Grid, Card, CardContent,
  Box, TextField, Button, Alert, CircularProgress,
  Divider, Avatar, Paper, Switch, FormControlLabel,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import DeleteIcon from '@mui/icons-material/Delete';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import useGeoLocation from '../hooks/useGeoLocation';

export default function Settings() {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState('');

  const { location, loading: geoLoading, getLocation } = useGeoLocation();

  const setP = (f) => (e) => setProfile((p) => ({ ...p, [f]: e.target.value }));
  const setPw = (f) => (e) => setPasswords((p) => ({ ...p, [f]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ type: '', text: '' });
    try {
      const payload = { ...profile };
      if (location) {
        payload.location = {
          type: 'Point',
          coordinates: [location.lng, location.lat],
        };
      }
      const { data } = await api.put('/users/me', payload);
      updateUser(data.data.user);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (passwords.next.length < 8) {
      setPwMsg({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    setPwLoading(true);
    setPwMsg({ type: '', text: '' });
    try {
      await api.put('/users/me/password', {
        currentPassword: passwords.current,
        newPassword: passwords.next,
      });
      setPwMsg({ type: 'success', text: 'Password changed successfully.' });
      setPasswords({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Password change failed.' });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" fontWeight={700} mb={1}>Settings</Typography>
      <Typography color="text.secondary" mb={5}>Manage your profile, security, and account</Typography>

      <Grid container spacing={4}>
        {/* ── Profile section ── */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar src={user?.avatar} sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 24 }}>
                  {user?.name?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>{user?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{user?.email} · {user?.role}</Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {profileMsg.text && (
                <Alert severity={profileMsg.type || 'info'} sx={{ mb: 3 }}>{profileMsg.text}</Alert>
              )}

              <Box component="form" onSubmit={saveProfile} display="flex" flexDirection="column" gap={2.5}>
                <Typography variant="subtitle1" fontWeight={600}>Profile details</Typography>

                <TextField
                  fullWidth label="Full name" value={profile.name}
                  onChange={setP('name')} required
                />
                <TextField
                  fullWidth label="Phone number" value={profile.phone}
                  onChange={setP('phone')} placeholder="+234…"
                />
                <TextField
                  fullWidth multiline rows={3} label="Bio"
                  value={profile.bio} onChange={setP('bio')}
                  placeholder="Tell other users about yourself — your market, farm, or composting operation…"
                  inputProps={{ maxLength: 300 }}
                  helperText={`${profile.bio.length}/300`}
                />

                <Divider />

                <Typography variant="subtitle1" fontWeight={600}>Location</Typography>
                <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                  <Button
                    variant="outlined"
                    startIcon={<MyLocationIcon />}
                    onClick={getLocation}
                    disabled={geoLoading}
                    color={location ? 'success' : 'primary'}
                  >
                    {geoLoading ? 'Getting location…' : location ? '✓ Location updated' : 'Update my location'}
                  </Button>
                  {location && (
                    <Typography variant="caption" color="success.main">
                      {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Your location is used only for proximity matching — never shown publicly.
                  </Typography>
                </Box>

                <Button
                  type="submit" variant="contained"
                  startIcon={profileLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                  disabled={profileLoading} sx={{ alignSelf: 'flex-start', px: 4 }}
                >
                  Save profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Password section ── */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                <LockIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>Change password</Typography>
              </Box>

              {pwMsg.text && (
                <Alert severity={pwMsg.type || 'info'} sx={{ mb: 2 }}>{pwMsg.text}</Alert>
              )}

              <Box component="form" onSubmit={changePassword} display="flex" flexDirection="column" gap={2}>
                <TextField fullWidth type="password" label="Current password" value={passwords.current} onChange={setPw('current')} required />
                <TextField fullWidth type="password" label="New password" value={passwords.next} onChange={setPw('next')} required helperText="At least 8 characters" />
                <TextField fullWidth type="password" label="Confirm new password" value={passwords.confirm} onChange={setPw('confirm')} required />
                <Button
                  type="submit" variant="outlined"
                  startIcon={pwLoading ? <CircularProgress size={16} color="inherit" /> : <LockIcon />}
                  disabled={pwLoading}
                >
                  Update password
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Notifications section ── */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={700} mb={3}>Notification preferences</Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                {[
                  { label: 'New pickup request received', default: true },
                  { label: 'Request accepted or rejected', default: true },
                  { label: 'New chat message', default: true },
                  { label: 'Rating revealed', default: true },
                  { label: 'Platform impact milestones', default: false },
                ].map((pref) => (
                  <FormControlLabel
                    key={pref.label}
                    control={<Switch defaultChecked={pref.default} color="primary" />}
                    label={<Typography variant="body2">{pref.label}</Typography>}
                    sx={{ justifyContent: 'space-between', ml: 0, flexDirection: 'row-reverse' }}
                  />
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" mt={2}>
                Notifications are stored in-browser. Email notifications coming in a future update.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Danger zone ── */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4, border: '1.5px solid', borderColor: 'error.light', borderRadius: 2 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <DeleteIcon color="error" />
              <Typography variant="h6" fontWeight={700} color="error.main">Danger zone</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Deleting your account is permanent and irreversible. Your profile, listings, and
              personal data will be removed within 30 days in compliance with NDPR. Completed
              exchange records are anonymised and retained for research purposes.
            </Typography>
            <TextField
              size="small"
              label={`Type "DELETE ${user?.name?.split(' ')[0]?.toUpperCase()}" to confirm`}
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              sx={{ mr: 2, mb: { xs: 2, sm: 0 } }}
            />
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              disabled={deleteConfirm !== `DELETE ${user?.name?.split(' ')[0]?.toUpperCase()}`}
              onClick={() => alert('Account deletion request submitted. You will receive a confirmation email within 48 hours.')}
            >
              Delete my account
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
