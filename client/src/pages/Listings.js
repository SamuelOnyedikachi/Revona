import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Typography, Grid, Box, MenuItem,
  Select, FormControl, InputLabel, CircularProgress,
  Button, Slider, Chip, ToggleButton, ToggleButtonGroup,
  Paper,
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import api from '../api';
import ListingCard from '../components/listings/ListingCard';
import ListingsMap from '../components/map/ListingsMap';
import EmptyState from '../components/common/EmptyState';
import useGeoLocation from '../hooks/useGeoLocation';
import EcoIcon from '@mui/icons-material/EnergySavingsLeaf';

const CATEGORIES = ['', 'fruit_waste', 'vegetable_waste', 'mixed_produce', 'other'];
const TARGET_USES = ['', 'animal_feed', 'compost', 'both'];

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState({ category: '', targetUse: '' });
  const [radiusKm, setRadiusKm] = useState(20);
  const { location, loading: geoLoading, error: geoError, getLocation } = useGeoLocation();

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (filter.category) params.append('category', filter.category);
      if (filter.targetUse) params.append('targetUse', filter.targetUse);
      if (location) {
        params.append('lat', location.lat);
        params.append('lng', location.lng);
        params.append('radiusKm', radiusKm);
      }
      const { data } = await api.get(`/listings?${params}`);
      setListings(data.data.listings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter, location, radiusKm]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Browse listings</Typography>
          <Typography color="text.secondary">
            {listings.length} active listing{listings.length !== 1 ? 's' : ''}
            {location ? ` within ${radiusKm} km of you` : ''}
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, v) => v && setViewMode(v)}
          size="small"
        >
          <ToggleButton value="grid"><ViewModuleIcon fontSize="small" sx={{ mr: 0.5 }} />Grid</ToggleButton>
          <ToggleButton value="map"><MapIcon fontSize="small" sx={{ mr: 0.5 }} />Map</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2.5, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select value={filter.category} label="Category"
                onChange={(e) => setFilter((f) => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>{c ? c.replace(/_/g, ' ') : 'All categories'}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Target use</InputLabel>
              <Select value={filter.targetUse} label="Target use"
                onChange={(e) => setFilter((f) => ({ ...f, targetUse: e.target.value }))}>
                {TARGET_USES.map((t) => (
                  <MenuItem key={t} value={t}>{t ? t.replace(/_/g, ' ') : 'All uses'}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Radius: {radiusKm} km
              </Typography>
              <Slider
                value={radiusKm}
                onChange={(_, v) => setRadiusKm(v)}
                min={2} max={50} step={1}
                disabled={!location}
                size="small"
                color="primary"
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant={location ? 'outlined' : 'contained'}
              startIcon={<MyLocationIcon />}
              onClick={getLocation}
              disabled={geoLoading}
              color={location ? 'success' : 'primary'}
              size="small"
            >
              {geoLoading ? 'Getting location…' : location ? 'Location set ✓' : 'Use my location'}
            </Button>
            {geoError && (
              <Typography variant="caption" color="error" display="block" mt={0.5}>{geoError}</Typography>
            )}
          </Grid>
        </Grid>

        {/* Active filter chips */}
        {(filter.category || filter.targetUse || location) && (
          <Box display="flex" gap={1} mt={2} flexWrap="wrap" alignItems="center">
            <Typography variant="caption" color="text.secondary">Active:</Typography>
            {filter.category && (
              <Chip size="small" label={filter.category.replace(/_/g, ' ')}
                onDelete={() => setFilter((f) => ({ ...f, category: '' }))} />
            )}
            {filter.targetUse && (
              <Chip size="small" label={filter.targetUse.replace(/_/g, ' ')}
                onDelete={() => setFilter((f) => ({ ...f, targetUse: '' }))} />
            )}
            {location && (
              <Chip size="small" label={`Within ${radiusKm} km`} color="success" variant="outlined" />
            )}
          </Box>
        )}
      </Paper>

      {/* Content */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
      ) : listings.length === 0 ? (
        <EmptyState
          icon={EcoIcon}
          title="No listings found"
          subtitle="Try adjusting your filters or expanding the search radius."
        />
      ) : viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {listings.map((l) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={l._id}>
              <ListingCard listing={l} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ height: 600, borderRadius: 3, overflow: 'hidden', boxShadow: 3 }}>
          <ListingsMap
            listings={listings}
            userLocation={location}
            radiusKm={radiusKm}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </Box>
      )}
    </Container>
  );
}
