import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import EcoIcon from '@mui/icons-material/EnergySavingsLeaf';

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8faf9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center', py: 8 }}>
        <EcoIcon sx={{ fontSize: 72, color: '#b7e4c7', mb: 3 }} />
        <Typography
          variant="h1"
          sx={{ fontSize: '6rem', fontWeight: 800, color: '#d8f3dc', lineHeight: 1 }}
        >
          404
        </Typography>
        <Typography variant="h5" fontWeight={700} mt={2} mb={1}>
          Page not found
        </Typography>
        <Typography color="text.secondary" mb={5}>
          This page seems to have composted itself. Let's get you back on track.
        </Typography>
        <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
          <Button component={Link} to="/" variant="contained" size="large">
            Go home
          </Button>
          <Button component={Link} to="/listings" variant="outlined" size="large">
            Browse listings
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
