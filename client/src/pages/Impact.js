import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Grid, Card, CardContent,
  Box, CircularProgress, Avatar, Paper, Divider,
  Tabs, Tab, Chip, LinearProgress,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend, LineChart, Line,
  CartesianGrid, AreaChart, Area,
} from 'recharts';
import EcoIcon from '@mui/icons-material/EnergySavingsLeaf';
import Co2Icon from '@mui/icons-material/Co2';
import ForestIcon from '@mui/icons-material/Forest';
import RecyclingIcon from '@mui/icons-material/Recycling';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const PALETTE = ['#2d6a4f', '#52b788', '#f4a261', '#e76f51', '#74c69d', '#b7e4c7'];

// ── Custom tooltip ─────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper sx={{ p: 1.5, borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="caption" fontWeight={700} display="block" mb={0.5}>{label}</Typography>
      {payload.map((p, i) => (
        <Typography key={i} variant="caption" display="block" sx={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong> {p.unit || ''}
        </Typography>
      ))}
    </Paper>
  );
};

// ── Stat card ──────────────────────────────────────────────
function StatCard({ icon, value, label, sub, color, bgcolor }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Avatar sx={{ bgcolor, color, width: 52, height: 52 }}>{icon}</Avatar>
          <Box>
            <Typography variant="h4" fontWeight={800} lineHeight={1}>{value}</Typography>
            <Typography variant="body2" fontWeight={600} mt={0.5}>{label}</Typography>
            {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ── SDG progress bar ───────────────────────────────────────
function SdgBar({ sdg, label, progress, color }) {
  return (
    <Box mb={2.5}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
        <Box display="flex" alignItems="center" gap={1}>
          <Chip label={`SDG ${sdg}`} size="small" sx={{ bgcolor: color, color: '#fff', fontWeight: 700, fontSize: 11 }} />
          <Typography variant="body2" fontWeight={500}>{label}</Typography>
        </Box>
        <Typography variant="caption" fontWeight={700} color="text.secondary">{progress}%</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ height: 8, borderRadius: 4, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 } }}
      />
    </Box>
  );
}

export default function Impact() {
  const { user } = useAuth();
  const [platform, setPlatform] = useState(null);
  const [personal, setPersonal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const fetches = [api.get('/impact/platform')];
    if (user) fetches.push(api.get('/impact/me'));
    Promise.all(fetches)
      .then(([p, me]) => {
        setPlatform(p.data.data);
        if (me) setPersonal(me.data.data);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;

  // ── Derived chart data ─────────────────────────────────
  const byProductData = platform ? [
    { name: 'Compost', value: platform.compostProducedKg, unit: 'kg' },
    { name: 'Animal feed', value: platform.animalFeedProducedKg, unit: 'kg' },
  ] : [];

  const impactBreakdown = platform ? [
    { name: 'Waste diverted', value: platform.wasteKgDiverted },
    { name: 'CO₂ saved', value: platform.co2SavedKg },
    { name: 'Compost', value: platform.compostProducedKg },
    { name: 'Feed', value: platform.animalFeedProducedKg },
  ] : [];

  // Simulate monthly trend (replace with real API data in Sprint 7)
  const monthlyTrend = [
    { month: 'Oct', kg: 18, co2: 10 },
    { month: 'Nov', kg: 34, co2: 18 },
    { month: 'Dec', kg: 52, co2: 28 },
    { month: 'Jan', kg: 71, co2: 39 },
    { month: 'Feb', kg: 98, co2: 54 },
    { month: 'Mar', kg: Math.round(platform?.wasteKgDiverted || 120), co2: Math.round(platform?.co2SavedKg || 66) },
  ];

  const trees = Math.round((platform?.co2SavedKg || 0) / 21.77);

  return (
    <Box sx={{ bgcolor: '#f8faf9', minHeight: '100vh', pb: 8 }}>
      {/* ── Hero banner ── */}
      <Box sx={{ background: 'linear-gradient(135deg,#1b4332,#2d6a4f,#40916c)', color: '#fff', py: { xs: 6, md: 10 }, mb: 6 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <EcoIcon sx={{ fontSize: 56, color: '#74c69d', mb: 2 }} />
          <Typography variant="h3" fontWeight={800} mb={1}>ReVora's environmental impact</Typography>
          <Typography variant="h6" fontWeight={400} sx={{ opacity: 0.85 }}>
            Every kilogram diverted from landfill matters — here's the proof
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* ── Tab switcher ── */}
        {user && (
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="🌍 Platform impact" />
            <Tab label="👤 My impact" />
          </Tabs>
        )}

        {/* ══ PLATFORM TAB ══ */}
        {tab === 0 && platform && (
          <>
            {/* Top stat cards */}
            <Grid container spacing={3} mb={5}>
              <Grid item xs={6} md={3}>
                <StatCard
                  icon={<RecyclingIcon />} value={`${platform.wasteKgDiverted} kg`}
                  label="Waste diverted" sub="from Nigerian landfills"
                  color="#2d6a4f" bgcolor="#d8f3dc"
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard
                  icon={<Co2Icon />} value={`${platform.co2SavedKg} kg`}
                  label="CO₂ avoided" sub="vs landfill methane"
                  color="#00796b" bgcolor="#e0f2f1"
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard
                  icon={<AgricultureIcon />} value={`${platform.animalFeedProducedKg} kg`}
                  label="Animal feed" sub="dry weight produced"
                  color="#e65100" bgcolor="#fff3e0"
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard
                  icon={<ForestIcon />} value={trees}
                  label="Tree equivalent" sub="CO₂ absorbed per year"
                  color="#1b4332" bgcolor="#d8f3dc"
                />
              </Grid>
            </Grid>

            <Grid container spacing={4}>
              {/* ── Monthly trend ── */}
              <Grid item xs={12} md={8}>
                <Card sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" fontWeight={700} mb={3}>Monthly waste diversion trend</Typography>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={monthlyTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="kgGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f4a261" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f4a261" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area type="monotone" dataKey="kg" name="Waste (kg)" stroke="#2d6a4f" strokeWidth={2} fill="url(#kgGrad)" />
                      <Area type="monotone" dataKey="co2" name="CO₂ saved (kg)" stroke="#f4a261" strokeWidth={2} fill="url(#co2Grad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>

              {/* ── By-product pie ── */}
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" fontWeight={700} mb={3}>By-product split</Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={byProductData}
                        cx="50%" cy="50%"
                        innerRadius={55} outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}
                        labelLine={false}
                      >
                        {byProductData.map((_, i) => (
                          <Cell key={i} fill={PALETTE[i]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `${v} kg`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Divider sx={{ my: 2 }} />
                  {byProductData.map((d, i) => (
                    <Box key={d.name} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: PALETTE[i] }} />
                        <Typography variant="body2">{d.name}</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={700}>{d.value} kg</Typography>
                    </Box>
                  ))}
                </Card>
              </Grid>

              {/* ── Bar chart ── */}
              <Grid item xs={12} md={7}>
                <Card sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} mb={3}>Impact overview (kg)</Typography>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={impactBreakdown} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} name="kg">
                        {impactBreakdown.map((_, i) => (
                          <Cell key={i} fill={PALETTE[i]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>

              {/* ── SDG alignment ── */}
              <Grid item xs={12} md={5}>
                <Card sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" fontWeight={700} mb={3}>SDG alignment</Typography>
                  <SdgBar sdg={2}  label="Zero Hunger"              progress={Math.min(trees * 3, 100)}                              color="#DDA63A" />
                  <SdgBar sdg={11} label="Sustainable Cities"       progress={Math.min(platform.listingsCompleted * 5, 100)}         color="#FD9D24" />
                  <SdgBar sdg={12} label="Responsible Consumption"  progress={Math.min(platform.wasteKgDiverted / 3, 100)}           color="#BF8B2E" />
                  <SdgBar sdg={13} label="Climate Action"           progress={Math.min(platform.co2SavedKg / 5, 100)}               color="#3F7E44" />
                  <Typography variant="caption" color="text.secondary" mt={1} display="block">
                    Progress bars are illustrative pilot indicators
                  </Typography>
                </Card>
              </Grid>

              {/* ── Methodology note ── */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: '#f0faf4', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>Methodology & conversion factors</Typography>
                  <Grid container spacing={2}>
                    {[
                      ['CO₂ avoided', '0.55 kg CO₂e per kg waste diverted from landfill (FAO, 2022)'],
                      ['Compost yield', '0.40 kg dry compost per kg organic input'],
                      ['Animal feed yield', '0.30 kg dry feed per kg organic input'],
                      ['CH₄ avoided', '0.10 kg methane per kg waste not landfilled (IPCC default)'],
                      ['Tree equivalent', '21.77 kg CO₂ absorbed per tree per year (FAO estimate)'],
                    ].map(([label, val]) => (
                      <Grid item xs={12} sm={6} md={4} key={label}>
                        <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                        <Typography variant="body2" fontWeight={500}>{val}</Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}

        {/* ══ PERSONAL TAB ══ */}
        {tab === 1 && personal && (
          <>
            <Grid container spacing={3} mb={5}>
              <Grid item xs={6} md={3}>
                <StatCard icon={<RecyclingIcon />} value={`${personal.wasteKgDiverted} kg`} label="You diverted" sub="from landfill" color="#2d6a4f" bgcolor="#d8f3dc" />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard icon={<Co2Icon />} value={`${personal.co2SavedKg} kg`} label="CO₂ you saved" sub="greenhouse gas avoided" color="#00796b" bgcolor="#e0f2f1" />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard icon={<EcoIcon />} value={personal.listingsCompleted} label="Exchanges completed" sub="successful pickups" color="#1b4332" bgcolor="#d8f3dc" />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard icon={<ForestIcon />} value={personal.equivalentTreesPlanted || 0} label="Tree equivalent" sub="your CO₂ per year" color="#2d6a4f" bgcolor="#b7e4c7" />
              </Grid>
            </Grid>

            {personal.wasteKgDiverted === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#f0faf4', borderRadius: 3 }}>
                <EcoIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" fontWeight={600} mb={1}>Your impact journey starts here</Typography>
                <Typography color="text.secondary">
                  Complete your first waste exchange to see your personal environmental stats.
                </Typography>
              </Paper>
            ) : (
              <Card sx={{ p: 4, textAlign: 'center', bgcolor: '#f0faf4' }}>
                <Typography variant="h4" fontWeight={800} color="primary.dark" mb={1}>
                  🌳 You've saved the equivalent of {personal.equivalentTreesPlanted || 0} trees this year
                </Typography>
                <Typography color="text.secondary">
                  By diverting {personal.wasteKgDiverted} kg of food waste, you've prevented {personal.co2SavedKg} kg of CO₂e
                  from entering the atmosphere — the same absorption as planting {personal.equivalentTreesPlanted || 0} trees.
                </Typography>
              </Card>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
