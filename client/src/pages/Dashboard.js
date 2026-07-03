import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Grid, Card, CardContent,
  Button, Box, Chip, CircularProgress, Avatar,
} from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EcoIcon from '@mui/icons-material/EnergySavingsLeaf';
import Co2Icon from '@mui/icons-material/Co2';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Dashboard() {
  const { user } = useAuth();
  const [myImpact, setMyImpact] = useState(null);
  const [recentListings, setRecentListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [impactRes, listingsRes, requestsRes] = await Promise.all([
          api.get('/impact/me'),
          user.role === 'vendor'
            ? api.get(`/listings/vendor/${user._id}`)
            : api.get('/listings?limit=6'),
          api.get('/requests'),
        ]);
        setMyImpact(impactRes.data.data);
        setRecentListings(
          user.role === 'vendor'
            ? listingsRes.data.data.listings
            : listingsRes.data.data.listings
        );
        setRequests(requestsRes.data.data.requests);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  if (loading) return (
    <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>
  );

  const STATUS_COLOR = { pending: 'warning', accepted: 'success', completed: 'default', rejected: 'error', cancelled: 'error' };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Welcome back, {user.name.split(' ')[0]} 👋
          </Typography>
          <Typography color="text.secondary">
            Here's your ReVora activity
          </Typography>
        </Box>
        {user.role === 'vendor' && (
          <Button component={Link} to="/listings/new" variant="contained" startIcon={<AddIcon />} size="large">
            Post listing
          </Button>
        )}
      </Box>

      {/* Impact stats */}
      {myImpact && (
        <Grid container spacing={3} mb={4}>
          {[
            { label: 'Waste diverted', value: `${myImpact.wasteKgDiverted} kg`, icon: <EcoIcon />, color: '#d8f3dc', iconColor: '#2d6a4f' },
            { label: 'CO₂ saved', value: `${myImpact.co2SavedKg} kg`, icon: <Co2Icon />, color: '#e0f2f1', iconColor: '#00796b' },
            { label: 'Exchanges', value: myImpact.listingsCompleted, icon: <ListAltIcon />, color: '#fff3e0', iconColor: '#e65100' },
            { label: 'Trees equivalent', value: myImpact.equivalentTreesPlanted || 0, icon: '🌳', color: '#f3e5f5', iconColor: '#7b1fa2' },
          ].map((s) => (
            <Grid item xs={6} md={3} key={s.label}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: s.color, color: s.iconColor, width: 48, height: 48, fontSize: typeof s.icon === 'string' ? 24 : 'inherit' }}>
                    {s.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>{s.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Grid container spacing={4}>
        {/* Recent listings */}
        <Grid item xs={12} md={7}>
          <Typography variant="h5" fontWeight={600} mb={2}>
            {user.role === 'vendor' ? 'My listings' : 'Recent listings near you'}
          </Typography>
          {recentListings.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center', bgcolor: '#f8faf9' }}>
              <Typography color="text.secondary" mb={2}>No listings yet</Typography>
              {user.role === 'vendor' && (
                <Button component={Link} to="/listings/new" variant="contained" startIcon={<AddIcon />}>Post your first listing</Button>
              )}
            </Card>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {recentListings.slice(0, 5).map((l) => (
                <Card key={l._id} component={Link} to={`/listings/${l._id}`} sx={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                  {l.photos?.[0] && (
                    <Box component="img" src={l.photos[0]} alt="" sx={{ width: 72, height: 72, borderRadius: 2, objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <Box flexGrow={1}>
                    <Typography variant="subtitle1" fontWeight={600}>{l.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{l.quantityKg} kg · {l.targetUse?.replace('_', ' ')}</Typography>
                  </Box>
                  <Chip label={l.status} size="small" color={l.status === 'active' ? 'success' : 'default'} />
                </Card>
              ))}
              <Button component={Link} to="/listings" variant="text">View all →</Button>
            </Box>
          )}
        </Grid>

        {/* Recent requests */}
        <Grid item xs={12} md={5}>
          <Typography variant="h5" fontWeight={600} mb={2}>Recent requests</Typography>
          {requests.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center', bgcolor: '#f8faf9' }}>
              <Typography color="text.secondary">No requests yet</Typography>
            </Card>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {requests.slice(0, 5).map((r) => (
                <Card key={r._id} sx={{ p: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ maxWidth: 180 }}>
                      {r.listing?.title || 'Listing'}
                    </Typography>
                    <Chip label={r.status} size="small" color={STATUS_COLOR[r.status] || 'default'} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {r.quantityRequestedKg} kg requested
                  </Typography>
                </Card>
              ))}
              <Button component={Link} to="/requests" variant="text">Manage requests →</Button>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
