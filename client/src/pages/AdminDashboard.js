import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Grid, Card, CardContent,
  Box, CircularProgress, Avatar, Chip,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TextField, Tab, Tabs,
  Alert, IconButton, Tooltip,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import ListAltIcon from '@mui/icons-material/ListAlt';
import RecyclingIcon from '@mui/icons-material/Recycling';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer, Legend } from 'recharts';

const ROLE_COLORS = { vendor: '#f4a261', farmer: '#52b788', composter: '#74c69d', admin: '#e76f51' };
const STATUS_COLORS = { active: '#52b788', reserved: '#f4a261', completed: '#8d99ae', expired: '#e76f51' };

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/dashboard'); return; }
    fetchAll();
  }, [user, navigate]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, u, l] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?limit=50'),
        api.get('/admin/listings?limit=50'),
      ]);
      setStats(s.data.data);
      setUsers(u.data.data.users);
      setListings(l.data.data.listings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const flash = (msg) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000); };

  const handleVerify = async (id) => {
    await api.patch(`/admin/users/${id}/verify`);
    flash('Verified status toggled');
    fetchAll();
  };

  const handleToggleActive = async (id) => {
    await api.patch(`/admin/users/${id}/deactivate`);
    flash('User active status toggled');
    fetchAll();
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Remove this listing permanently?')) return;
    await api.delete(`/admin/listings/${id}`);
    flash('Listing removed');
    fetchAll();
  };

  const filteredUsers = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;

  const roleData = stats?.usersByRole?.map((r) => ({
    name: r._id, value: r.count, fill: ROLE_COLORS[r._id] || '#8d99ae',
  })) || [];

  const listingStatusData = stats?.listingsByStatus?.map((s) => ({
    name: s._id, value: s.count, fill: STATUS_COLORS[s._id] || '#8d99ae',
  })) || [];

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <Avatar sx={{ bgcolor: 'error.main', width: 48, height: 48 }}>A</Avatar>
        <Box>
          <Typography variant="h4" fontWeight={800}>Admin Dashboard</Typography>
          <Typography color="text.secondary">ReVora platform management</Typography>
        </Box>
      </Box>

      {actionMsg && <Alert severity="success" sx={{ mb: 3 }}>{actionMsg}</Alert>}

      {/* ── Top stats ── */}
      <Grid container spacing={3} mb={5}>
        {[
          { icon: <PeopleIcon />, value: stats.totals.users, label: 'Total users', color: '#2d6a4f', bg: '#d8f3dc' },
          { icon: <ListAltIcon />, value: stats.totals.listings, label: 'Total listings', color: '#e65100', bg: '#fff3e0' },
          { icon: <RecyclingIcon />, value: `${stats.totalWasteKgDiverted} kg`, label: 'Waste diverted', color: '#00796b', bg: '#e0f2f1' },
          { icon: <StarIcon />, value: stats.totals.ratings, label: 'Ratings given', color: '#f57f17', bg: '#fff8e1' },
        ].map((s) => (
          <Grid item xs={6} md={3} key={s.label}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: s.bg, color: s.color }}>{s.icon}</Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={800}>{s.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Charts row ── */}
      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Users by role</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {roleData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <RTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Listings by status</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={listingStatusData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {listingStatusData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <RTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>

      {/* ── Tabs: Users / Listings ── */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label={`Users (${users.length})`} />
        <Tab label={`Listings (${listings.length})`} />
      </Tabs>

      {/* ── Users table ── */}
      {tab === 0 && (
        <>
          <TextField
            size="small" placeholder="Search by name or email…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2, width: 340 }}
          />
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8faf9' }}>
                  {['User', 'Role', 'Rating', 'Badges', 'Status', 'Actions'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u._id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'primary.light' }}>
                          {u.name?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{u.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={u.role} size="small" sx={{ bgcolor: ROLE_COLORS[u.role] + '33', color: ROLE_COLORS[u.role], fontWeight: 600, fontSize: 11 }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{u.averageRating > 0 ? `⭐ ${u.averageRating.toFixed(1)} (${u.totalRatings})` : '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        {u.badges?.map((b) => (
                          <Chip key={b} label={b.replace('_', ' ')} size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={u.isActive ? 'success' : 'error'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        <Tooltip title={u.isVerified ? 'Remove verified badge' : 'Grant verified badge'}>
                          <IconButton size="small" color={u.isVerified ? 'success' : 'default'} onClick={() => handleVerify(u._id)}>
                            <VerifiedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={u.isActive ? 'Deactivate account' : 'Reactivate account'}>
                          <IconButton size="small" color={u.isActive ? 'warning' : 'success'} onClick={() => handleToggleActive(u._id)}>
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* ── Listings table ── */}
      {tab === 1 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8faf9' }}>
                {['Title', 'Vendor', 'Category', 'Qty (kg)', 'Status', 'Posted', 'Action'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {listings.map((l) => (
                <TableRow key={l._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 160 }}>{l.title}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{l.vendor?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{l.vendor?.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={l.category?.replace(/_/g, ' ')} size="small" variant="outlined" sx={{ fontSize: 10 }} />
                  </TableCell>
                  <TableCell><Typography variant="body2">{l.quantityKg}</Typography></TableCell>
                  <TableCell>
                    <Chip
                      label={l.status}
                      size="small"
                      sx={{ bgcolor: (STATUS_COLORS[l.status] || '#8d99ae') + '22', color: STATUS_COLORS[l.status] || '#8d99ae', fontWeight: 600, fontSize: 11 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(l.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Remove listing">
                      <IconButton size="small" color="error" onClick={() => handleDeleteListing(l._id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
