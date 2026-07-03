import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Container, Grid, Card,
  CardContent, Chip, Avatar, Paper,
} from '@mui/material';
import { Link } from 'react-router-dom';
import EcoIcon from '@mui/icons-material/EnergySavingsLeaf';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import RecyclingIcon from '@mui/icons-material/Recycling';
import SpeedIcon from '@mui/icons-material/Speed';
import VerifiedIcon from '@mui/icons-material/Verified';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import api from '../api';

const HOW_IT_WORKS = [
  {
    icon: <EcoIcon sx={{ fontSize: 36 }} />,
    title: 'Vendors post waste',
    desc: 'Market vendors photograph and list surplus fruit & vegetable waste with quantity, location, and target use.',
    color: '#d8f3dc',
    iconColor: '#2d6a4f',
  },
  {
    icon: <AgricultureIcon sx={{ fontSize: 36 }} />,
    title: 'Farmers & composters match',
    desc: 'Our geo-matching engine surfaces nearby listings ranked by proximity and vendor rating.',
    color: '#fff3e0',
    iconColor: '#e76f51',
  },
  {
    icon: <RecyclingIcon sx={{ fontSize: 36 }} />,
    title: 'Waste becomes value',
    desc: 'Pickup is coordinated, waste is diverted from landfill, and both parties rate each other — building trust.',
    color: '#e8f4fd',
    iconColor: '#2196f3',
  },
];

export default function Landing() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/impact/platform').then(({ data }) => setStats(data.data)).catch(() => {});
  }, []);

  return (
    <Box>
      <Navbar />

      {/* ── Hero ── */}
      <Box
        sx={{
          background: 'linear-gradient(160deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%)',
          color: '#fff',
          py: { xs: 10, md: 16 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* decorative blobs */}
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', bgcolor: 'rgba(82,183,136,0.12)' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(82,183,136,0.08)' }} />

        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Chip label="🌍 Built for Nigeria's circular economy" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', mb: 3, fontWeight: 600 }} />
          <Typography variant="h1" sx={{ fontSize: { xs: '2.4rem', md: '3.6rem' }, mb: 3, lineHeight: 1.15 }}>
            Turn market waste into{' '}
            <Box component="span" sx={{ color: '#74c69d' }}>
              valuable by-products
            </Box>
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.85, mb: 5, fontWeight: 400, maxWidth: 600, mx: 'auto', lineHeight: 1.7 }}>
            ReVora connects fruit &amp; vegetable waste generators with poultry farmers and
            composters — reducing methane emissions and lowering feed costs across Nigerian cities.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              size="large"
              sx={{ bgcolor: '#52b788', '&:hover': { bgcolor: '#40916c' }, px: 4, py: 1.5, fontSize: '1rem' }}
            >
              Join ReVora — it's free
            </Button>
            <Button
              component={Link}
              to="/listings"
              variant="outlined"
              size="large"
              sx={{ borderColor: 'rgba(255,255,255,0.5)', color: '#fff', px: 4, py: 1.5, fontSize: '1rem', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.05)' } }}
            >
              Browse listings
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── Live impact counter ── */}
      {stats && (
        <Box sx={{ bgcolor: '#d8f3dc', py: 4 }}>
          <Container maxWidth="md">
            <Grid container spacing={3} justifyContent="center" textAlign="center">
              {[
                { value: `${stats.wasteKgDiverted} kg`, label: 'Waste diverted' },
                { value: `${stats.co2SavedKg} kg`, label: 'CO₂ saved' },
                { value: `${stats.compostProducedKg} kg`, label: 'Compost produced' },
                { value: stats.listingsCompleted, label: 'Exchanges completed' },
              ].map((s) => (
                <Grid item xs={6} md={3} key={s.label}>
                  <Typography variant="h4" sx={{ color: '#1b4332', fontWeight: 800 }}>{s.value}</Typography>
                  <Typography variant="body2" sx={{ color: '#40916c', fontWeight: 500 }}>{s.label}</Typography>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* ── How it works ── */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Typography variant="h3" textAlign="center" mb={2}>How ReVora works</Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" mb={7}>
          Three steps from waste to value
        </Typography>
        <Grid container spacing={4}>
          {HOW_IT_WORKS.map((step, i) => (
            <Grid item xs={12} md={4} key={step.title}>
              <Card sx={{ height: '100%', p: 1 }}>
                <CardContent>
                  <Avatar sx={{ bgcolor: step.color, color: step.iconColor, width: 64, height: 64, mb: 2 }}>
                    {step.icon}
                  </Avatar>
                  <Chip label={`Step ${i + 1}`} size="small" sx={{ mb: 1.5, bgcolor: step.color, color: step.iconColor, fontWeight: 600 }} />
                  <Typography variant="h5" gutterBottom>{step.title}</Typography>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.7}>{step.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ── Trust features ── */}
      <Box sx={{ bgcolor: '#f0faf4', py: { xs: 8, md: 10 } }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" mb={2}>Built on trust</Typography>
          <Typography variant="body1" color="text.secondary" mb={6}>
            Every feature is designed to make exchanges safe and reliable
          </Typography>
          <Grid container spacing={3}>
            {[
              { icon: <VerifiedIcon />, title: 'Photo verification', desc: 'Vendors upload photos of waste before pickup' },
              { icon: <SpeedIcon />, title: 'Geo-matching engine', desc: 'Instantly surfaces the nearest matching listings' },
              { icon: <EcoIcon />, title: 'Double-blind ratings', desc: 'Both parties rate simultaneously — no bias' },
              { icon: <RecyclingIcon />, title: 'Impact tracker', desc: 'Real-time CO₂ and by-product calculations' },
            ].map((f) => (
              <Grid item xs={12} sm={6} key={f.title}>
                <Paper sx={{ p: 3, textAlign: 'left', display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Avatar sx={{ bgcolor: '#d8f3dc', color: '#2d6a4f' }}>{f.icon}</Avatar>
                  <Box>
                    <Typography variant="h6" gutterBottom>{f.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── CTA ── */}
      <Box sx={{ background: 'linear-gradient(135deg,#2d6a4f,#40916c)', py: { xs: 8, md: 12 }, textAlign: 'center', color: '#fff' }}>
        <Container maxWidth="sm">
          <Typography variant="h3" mb={2}>Ready to close the loop?</Typography>
          <Typography variant="body1" mb={4} sx={{ opacity: 0.85 }}>
            Join vendors, farmers, and composters already building Nigeria's circular food economy.
          </Typography>
          <Button
            component={Link}
            to="/register"
            variant="contained"
            size="large"
            sx={{ bgcolor: '#fff', color: '#2d6a4f', fontWeight: 700, px: 5, py: 1.5, '&:hover': { bgcolor: '#d8f3dc' } }}
          >
            Get started free
          </Button>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
