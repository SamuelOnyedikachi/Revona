import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container, Typography, Box, Chip, Button,
  CircularProgress, Grid, Paper, Alert, Avatar,
  Divider, Rating, TextField,
} from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import ScaleIcon from '@mui/icons-material/Scale';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { format } from 'date-fns';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import BadgeChip from '../components/common/BadgeChip';

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reqForm, setReqForm] = useState({ message: '', quantityKg: '' });
  const [requesting, setRequesting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(({ data }) => {
        setListing(data.data.listing);
        setReqForm((f) => ({ ...f, quantityKg: data.data.listing.quantityKg }));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleRequest = async () => {
    setRequesting(true); setError('');
    try {
      await api.post('/requests', {
        listingId: id,
        quantityRequestedKg: reqForm.quantityKg,
        message: reqForm.message,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;
  if (!listing) return (
    <Container sx={{ py: 5 }}>
      <Alert severity="error">Listing not found.</Alert>
    </Container>
  );

  const vendor = listing.vendor;
  const isOwner = user?._id === vendor?._id;
  const canRequest = user && !isOwner && ['farmer', 'composter'].includes(user.role) && listing.status === 'active';

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Back */}
      <Button component={Link} to="/listings" startIcon={<ArrowBackIcon />} sx={{ mb: 3 }} color="inherit">
        Back to listings
      </Button>

      <Grid container spacing={4}>
        {/* ── Left: photos + details ── */}
        <Grid item xs={12} md={7}>
          {/* Photo gallery */}
          {listing.photos?.length > 0 ? (
            <Box>
              <Box
                component="img"
                src={listing.photos[activePhoto]}
                alt={listing.title}
                sx={{ width: '100%', borderRadius: 3, maxHeight: 380, objectFit: 'cover', mb: 1.5 }}
              />
              {listing.photos.length > 1 && (
                <Box display="flex" gap={1}>
                  {listing.photos.map((p, i) => (
                    <Box
                      key={i}
                      component="img"
                      src={p}
                      onClick={() => setActivePhoto(i)}
                      sx={{
                        width: 64, height: 64, borderRadius: 1.5, objectFit: 'cover',
                        cursor: 'pointer', border: '2px solid',
                        borderColor: activePhoto === i ? 'primary.main' : 'transparent',
                        transition: 'border-color 0.2s',
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ width: '100%', height: 280, bgcolor: '#f0faf4', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">No photos uploaded</Typography>
            </Box>
          )}

          {/* Tags + title */}
          <Box display="flex" gap={1} mt={3} mb={1.5} flexWrap="wrap">
            <Chip label={listing.category?.replace(/_/g, ' ')} color="success" variant="outlined" />
            <Chip label={listing.targetUse?.replace(/_/g, ' ')} color="warning" variant="outlined" />
            <Chip
              label={listing.status}
              color={listing.status === 'active' ? 'success' : 'default'}
              sx={{ fontWeight: 700 }}
            />
          </Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>{listing.title}</Typography>
          {listing.description && (
            <Typography color="text.secondary" lineHeight={1.7} mb={3}>{listing.description}</Typography>
          )}

          {/* Meta grid */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Grid container spacing={2}>
              {[
                { icon: <ScaleIcon />, label: 'Quantity', value: `${listing.quantityKg} kg` },
                { icon: <PlaceIcon />, label: 'Location', value: listing.location?.address || 'On request' },
                { icon: <CalendarTodayIcon />, label: 'Available until', value: listing.availableUntil ? format(new Date(listing.availableUntil), 'dd MMM yyyy') : '—' },
                { icon: <VisibilityIcon />, label: 'Views', value: listing.views },
              ].map((m) => (
                <Grid item xs={6} key={m.label}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ color: 'primary.main', display: 'flex' }}>{m.icon}</Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">{m.label}</Typography>
                      <Typography variant="body2" fontWeight={600}>{m.value}</Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* ── Right: vendor + request ── */}
        <Grid item xs={12} md={5}>
          {/* Vendor card */}
          {vendor && (
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" mb={2}>Listed by</Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={vendor.avatar}
                  component={Link}
                  to={`/profile/${vendor._id}`}
                  sx={{ width: 52, height: 52, bgcolor: 'primary.main', textDecoration: 'none', fontSize: 20 }}
                >
                  {vendor.name?.[0]}
                </Avatar>
                <Box flexGrow={1}>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    component={Link}
                    to={`/profile/${vendor._id}`}
                    sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { color: 'primary.main' } }}
                  >
                    {vendor.name}
                  </Typography>
                  {vendor.averageRating > 0 && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Rating value={vendor.averageRating} size="small" readOnly precision={0.5} />
                      <Typography variant="caption" color="text.secondary">
                        {vendor.averageRating.toFixed(1)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
              {vendor.badges?.length > 0 && (
                <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                  {vendor.badges.map((b) => <BadgeChip key={b} badge={b} />)}
                </Box>
              )}
            </Paper>
          )}

          {/* Request panel */}
          <Paper sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 80 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Request this waste</Typography>

            {success ? (
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                ✅ Request sent! The vendor will review and accept or reject it.
                <Button component={Link} to="/requests" size="small" sx={{ mt: 1 }} fullWidth variant="outlined">
                  View my requests
                </Button>
              </Alert>
            ) : (
              <>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {canRequest ? (
                  <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                      fullWidth size="small" type="number" label="Quantity you need (kg)"
                      value={reqForm.quantityKg}
                      onChange={(e) => setReqForm((f) => ({ ...f, quantityKg: e.target.value }))}
                      inputProps={{ min: 1, max: listing.quantityKg }}
                      helperText={`Max ${listing.quantityKg} kg available`}
                    />
                    <TextField
                      fullWidth size="small" multiline rows={3} label="Message to vendor"
                      value={reqForm.message}
                      onChange={(e) => setReqForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Introduce yourself — your farm, how you'll use the waste…"
                      inputProps={{ maxLength: 300 }}
                    />
                    <Button
                      fullWidth variant="contained" size="large"
                      onClick={handleRequest} disabled={requesting}
                      sx={{ py: 1.5 }}
                    >
                      {requesting ? <CircularProgress size={22} color="inherit" /> : '📦 Send pickup request'}
                    </Button>
                    <Typography variant="caption" color="text.secondary" textAlign="center">
                      No payment on ReVora — logistics are arranged between parties
                    </Typography>
                  </Box>
                ) : !user ? (
                  <Button component={Link} to="/register" fullWidth variant="contained" size="large">
                    Join to request this listing
                  </Button>
                ) : isOwner ? (
                  <Alert severity="info">This is your listing.</Alert>
                ) : listing.status !== 'active' ? (
                  <Alert severity="warning">This listing is no longer available.</Alert>
                ) : (
                  <Alert severity="info">Only farmers and composters can request waste listings.</Alert>
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
