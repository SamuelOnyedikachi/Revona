import React, { useState } from 'react';
import {
  Box, Container, Typography, TextField, Button,
  Alert, Paper, CircularProgress, Link as MuiLink,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import EcoIcon from '@mui/icons-material/EnergySavingsLeaf';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8faf9', display: 'flex', alignItems: 'center', py: 6 }}>
      <Container maxWidth="xs">
        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
          <Box textAlign="center" mb={4}>
            <EcoIcon sx={{ fontSize: 44, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={700} gutterBottom>Welcome back</Typography>
            <Typography color="text.secondary">Log in to your ReVora account</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Email address" type="email" required
              value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth label="Password" type="password" required
              value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              sx={{ mb: 3 }}
            />
            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ py: 1.5 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Log in'}
            </Button>
          </Box>

          <Typography textAlign="center" mt={3} variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <MuiLink component={Link} to="/register" color="primary" fontWeight={600}>Join ReVora</MuiLink>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
