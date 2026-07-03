import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, CircularProgress,
  Divider, Fade,
} from '@mui/material';
import EcoIcon from '@mui/icons-material/EnergySavingsLeaf';
import Co2Icon from '@mui/icons-material/Co2';
import ForestIcon from '@mui/icons-material/Forest';
import api from '../../api';

/**
 * ImpactEstimator
 * Props:
 *   quantityKg: number | ''
 *   targetUse: 'animal_feed' | 'compost' | 'both'
 *
 * Shows a live estimate panel that updates as the user types
 */
export default function ImpactEstimator({ quantityKg, targetUse }) {
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const kg = parseFloat(quantityKg);
    if (!kg || kg <= 0 || !targetUse) {
      setEstimate(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.post('/impact/estimate', { quantityKg: kg, targetUse });
        setEstimate(data.data);
      } catch {
        // silent fail — estimate is non-critical
      } finally {
        setLoading(false);
      }
    }, 600); // debounce 600 ms

    return () => clearTimeout(timeout);
  }, [quantityKg, targetUse]);

  if (!quantityKg || parseFloat(quantityKg) <= 0) return null;

  return (
    <Fade in>
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderColor: 'primary.light',
          bgcolor: '#f0faf4',
          borderRadius: 2,
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
          <EcoIcon color="primary" fontSize="small" />
          <Typography variant="subtitle2" fontWeight={700} color="primary.dark">
            Estimated impact of this listing
          </Typography>
          {loading && <CircularProgress size={14} color="primary" sx={{ ml: 'auto' }} />}
        </Box>

        {estimate && !loading && (
          <Box display="flex" gap={3} flexWrap="wrap">
            <Box display="flex" alignItems="center" gap={1}>
              <Co2Icon sx={{ color: '#00796b', fontSize: 22 }} />
              <Box>
                <Typography variant="h6" fontWeight={800} color="primary.dark" lineHeight={1}>
                  {estimate.co2SavedKg} kg
                </Typography>
                <Typography variant="caption" color="text.secondary">CO₂ avoided</Typography>
              </Box>
            </Box>

            <Divider orientation="vertical" flexItem />

            <Box display="flex" alignItems="center" gap={1}>
              <Box component="span" sx={{ fontSize: 20 }}>
                {targetUse === 'animal_feed' ? '🐓' : targetUse === 'compost' ? '♻️' : '🌱'}
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={800} color="primary.dark" lineHeight={1}>
                  {estimate.byProductKg} kg
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {targetUse === 'animal_feed' ? 'animal feed' : targetUse === 'compost' ? 'compost' : 'by-product'}
                </Typography>
              </Box>
            </Box>

            <Divider orientation="vertical" flexItem />

            <Box display="flex" alignItems="center" gap={1}>
              <ForestIcon sx={{ color: '#2d6a4f', fontSize: 22 }} />
              <Box>
                <Typography variant="h6" fontWeight={800} color="primary.dark" lineHeight={1}>
                  {estimate.methaneAvoidedKg} kg
                </Typography>
                <Typography variant="caption" color="text.secondary">CH₄ avoided</Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>
    </Fade>
  );
}
