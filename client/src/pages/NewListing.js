import React, { useState } from 'react';
import {
  Container, Typography, Box, TextField, MenuItem,
  Select, FormControl, InputLabel, Button, CircularProgress,
  Alert, Paper, Divider, Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '../api';
import LocationPicker from '../components/map/LocationPicker';
import ImpactEstimator from '../components/impact/ImpactEstimator';

const CATEGORIES = ['fruit_waste', 'vegetable_waste', 'mixed_produce', 'other'];
const TARGET_USES = ['animal_feed', 'compost', 'both'];

export default function NewListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '',
    category: 'fruit_waste', targetUse: 'both',
    quantityKg: '', availableUntil: '', address: '',
  });
  const [location, setLocation] = useState(null); // { lat, lng }
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setPhotos(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) { setError('Please select a pickup location on the map'); return; }
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('latitude', location.lat);
      fd.append('longitude', location.lng);
      photos.forEach((f) => fd.append('photos', f));
      const { data } = await api.post('/listings', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/listings/${data.data.listing._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" fontWeight={700} mb={1}>Post a waste listing</Typography>
      <Typography color="text.secondary" mb={4}>
        List your surplus fruit or vegetable waste — farmers and composters will find it.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={4}>
        {/* ── Left col: form ── */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>Listing details</Typography>

            <Box display="flex" flexDirection="column" gap={2.5} component="form" onSubmit={handleSubmit} id="listing-form">
              <TextField
                fullWidth required label="Listing title"
                value={form.title} onChange={set('title')}
                placeholder="e.g. Mixed tomato & pepper offcuts"
              />
              <TextField
                fullWidth multiline rows={3} label="Description"
                value={form.description} onChange={set('description')}
                placeholder="Quality, freshness, any special notes…"
                inputProps={{ maxLength: 500 }}
                helperText={`${form.description.length}/500`}
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Category</InputLabel>
                    <Select value={form.category} label="Category" onChange={set('category')}>
                      {CATEGORIES.map((c) => (
                        <MenuItem key={c} value={c}>{c.replace(/_/g, ' ')}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Target use</InputLabel>
                    <Select value={form.targetUse} label="Target use" onChange={set('targetUse')}>
                      {TARGET_USES.map((t) => (
                        <MenuItem key={t} value={t}>{t.replace(/_/g, ' ')}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth required label="Quantity (kg)" type="number"
                    value={form.quantityKg} onChange={set('quantityKg')}
                    inputProps={{ min: 1, step: 0.5 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth required label="Available until" type="date"
                    value={form.availableUntil} onChange={set('availableUntil')}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth label="Pickup address / market name"
                value={form.address} onChange={set('address')}
                placeholder="e.g. Mile 12 Market, Lagos"
              />

              <Divider />

              {/* Photo upload */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600} mb={1}>
                  Photos <Typography component="span" variant="caption" color="text.secondary">(up to 5)</Typography>
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ py: 1.5, borderStyle: 'dashed' }}
                >
                  Upload photos
                  <input hidden accept="image/*" multiple type="file" onChange={handlePhotos} />
                </Button>
                {previews.length > 0 && (
                  <Box display="flex" gap={1} mt={1.5} flexWrap="wrap">
                    {previews.map((src, i) => (
                      <Box
                        key={i}
                        component="img"
                        src={src}
                        alt={`preview-${i}`}
                        sx={{ width: 72, height: 72, borderRadius: 1.5, objectFit: 'cover', border: '1.5px solid', borderColor: 'primary.light' }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* ── Right col: map + impact ── */}
        <Grid item xs={12} md={5}>
          <Box display="flex" flexDirection="column" gap={3}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <LocationPicker
                value={location}
                onChange={setLocation}
                label="Pickup location (click map)"
              />
            </Paper>

            {/* Live impact estimate */}
            <ImpactEstimator
              quantityKg={form.quantityKg}
              targetUse={form.targetUse}
            />

            <Button
              type="submit"
              form="listing-form"
              variant="contained"
              size="large"
              disabled={loading}
              fullWidth
              sx={{ py: 1.8, fontSize: '1rem' }}
            >
              {loading
                ? <CircularProgress size={22} color="inherit" />
                : '🌱 Post listing'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
