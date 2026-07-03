import React from 'react';
import { Box, Typography, Link, Divider } from '@mui/material';
import EcoIcon from '@mui/icons-material/EnergySavingsLeaf';

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: '#1b4332', color: 'rgba(255,255,255,0.8)', mt: 'auto' }}>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EcoIcon sx={{ color: '#52b788' }} />
          <Typography variant="h6" sx={{ color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}>
            ReVora
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          Contributing to SDGs 2, 11, 12 &amp; 13 · Built for Nigeria's circular economy
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.6 }}>
          © {new Date().getFullYear()} ReVora · Data protected under{' '}
          <Link href="#" color="inherit" underline="hover">NDPR</Link>
        </Typography>
      </Box>
    </Box>
  );
}
