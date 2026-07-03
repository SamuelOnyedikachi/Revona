import React, { useState } from 'react';
import {
  Box, Container, Typography, TextField, Button,
  ToggleButtonGroup, ToggleButton, Alert, Checkbox,
  FormControlLabel, Paper, CircularProgress, Link as MuiLink,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import EcoIcon from '@mui/icons-material/EnergySavingsLeaf';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import RecyclingIcon from '@mui/icons-material/Recycling';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'vendor', label: 'Market Vendor', icon: <EcoIcon />, desc: 'I have fruit/veg waste to share' },
  { value: 'farmer', label: 'Poultry Farmer', icon: <AgricultureIcon />, desc: 'I need clean feed material' },
  { value: 'composter', label: 'Composter', icon: <RecyclingIcon />, desc: 'I produce compost from organics' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '', phone: '', consentGiven: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.role) { setError('Please select your role'); return; }
    if (!form.consentGiven) { setError('Please accept the data consent terms'); return; }
    setLoading(true);
    setError('');
    try {
      const user = await register({ ...form, consentGiven: 'true' });
      navigate(user.role === 'vendor' ? '/listings/new' : '/listings');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8faf9', display: 'flex', alignItems: 'center', py: 6 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <EcoIcon sx={{ fontSize: 44, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={700} gutterBottom>Join ReVora</Typography>
            <Typography color="text.secondary">Create your free account</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            {/* Role selector */}
            <Typography variant="subtitle2" fontWeight={600} mb={1.5}>I am a…</Typography>
            <ToggleButtonGroup
              value={form.role}
              exclusive
              onChange={(_, v) => v && setForm((f) => ({ ...f, role: v }))}
              sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}
            >
              {ROLES.map((r) => (
                <ToggleButton
                  key={r.value}
                  value={r.value}
                  sx={{
                    justifyContent: 'flex-start',
                    gap: 2,
                    px: 2,
                    py: 1.5,
                    border: '1.5px solid',
                    borderColor: form.role === r.value ? 'primary.main' : 'divider',
                    borderRadius: '10px !important',
                    '&.Mui-selected': { bgcolor: '#eaf7f0', borderColor: 'primary.main' },
                  }}
                >
                  <Box sx={{ color: 'primary.main' }}>{r.icon}</Box>
                  <Box textAlign="left">
                    <Typography variant="body1" fontWeight={600}>{r.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{r.desc}</Typography>
                  </Box>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <TextField fullWidth label="Full name" value={form.name} onChange={set('name')} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Email address" type="email" value={form.email} onChange={set('email')} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Phone number" value={form.phone} onChange={set('phone')} placeholder="+234..." sx={{ mb: 2 }} />
            <TextField fullWidth label="Password" type="password" value={form.password} onChange={set('password')} required helperText="At least 8 characters" sx={{ mb: 3 }} />

            {/* NDPR consent */}
            <FormControlLabel
              sx={{ mb: 3, alignItems: 'flex-start' }}
              control={
                <Checkbox
                  checked={form.consentGiven}
                  onChange={(e) => setForm((f) => ({ ...f, consentGiven: e.target.checked }))}
                  color="primary"
                  sx={{ mt: -0.5 }}
                />
              }
              label={
                <Typography variant="body2" color="text.secondary">
                  I consent to my data being stored and processed by ReVora in accordance with the{' '}
                  <MuiLink href="#" target="_blank" color="primary">Nigeria Data Protection Regulation (NDPR)</MuiLink>.
                </Typography>
              }
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create account'}
            </Button>
          </Box>

          <Typography textAlign="center" mt={3} variant="body2" color="text.secondary">
            Already have an account?{' '}
            <MuiLink component={Link} to="/login" color="primary" fontWeight={600}>Log in</MuiLink>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
