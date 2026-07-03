import React from 'react';
import {
  Card, CardMedia, CardContent, CardActions,
  Typography, Box, Chip, Button, Avatar, Rating,
} from '@mui/material';
import { Link } from 'react-router-dom';
import PlaceIcon from '@mui/icons-material/Place';
import ScaleIcon from '@mui/icons-material/Scale';
import EcoIcon from '@mui/icons-material/EnergySavingsLeaf';

const CATEGORY_COLORS = {
  fruit_waste: { bg: '#fff3e0', color: '#e65100', label: '🍅 Fruit' },
  vegetable_waste: { bg: '#e8f5e9', color: '#2e7d32', label: '🥬 Vegetable' },
  mixed_produce: { bg: '#fce4ec', color: '#880e4f', label: '🫙 Mixed' },
  other: { bg: '#f3e5f5', color: '#6a1b9a', label: '📦 Other' },
};

const TARGET_LABELS = {
  animal_feed: '🐓 Feed',
  compost: '♻️ Compost',
  both: '🐓 Feed + ♻️ Compost',
};

/**
 * ListingCard
 * Props: listing object (populated with vendor)
 *        compact?: boolean — smaller version for dashboard
 */
export default function ListingCard({ listing, compact = false }) {
  const cat = CATEGORY_COLORS[listing.category] || CATEGORY_COLORS.other;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Status badge */}
      {listing.status !== 'active' && (
        <Chip
          label={listing.status}
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1,
            fontWeight: 700,
            bgcolor: listing.status === 'reserved' ? '#ff9800' : '#9e9e9e',
            color: '#fff',
          }}
        />
      )}

      {listing.photos?.[0] ? (
        <CardMedia
          component="img"
          height={compact ? 130 : 180}
          image={listing.photos[0]}
          alt={listing.title}
          sx={{ objectFit: 'cover' }}
        />
      ) : (
        <Box
          sx={{
            height: compact ? 130 : 180,
            bgcolor: cat.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <EcoIcon sx={{ fontSize: 48, color: cat.color, opacity: 0.5 }} />
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Tags */}
        <Box display="flex" gap={0.8} mb={1.2} flexWrap="wrap">
          <Chip
            label={cat.label}
            size="small"
            sx={{ bgcolor: cat.bg, color: cat.color, fontWeight: 600, fontSize: 11 }}
          />
          <Chip
            label={TARGET_LABELS[listing.targetUse] || listing.targetUse}
            size="small"
            variant="outlined"
            sx={{ fontSize: 11 }}
          />
        </Box>

        <Typography variant={compact ? 'body1' : 'h6'} fontWeight={700} gutterBottom noWrap>
          {listing.title}
        </Typography>

        {!compact && listing.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {listing.description}
          </Typography>
        )}

        {/* Meta */}
        <Box display="flex" gap={2} flexWrap="wrap">
          <Box display="flex" alignItems="center" gap={0.4}>
            <ScaleIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">{listing.quantityKg} kg</Typography>
          </Box>
          {listing.location?.address && (
            <Box display="flex" alignItems="center" gap={0.4}>
              <PlaceIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 120 }}>
                {listing.location.address}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Vendor */}
        {listing.vendor && !compact && (
          <Box display="flex" alignItems="center" gap={1} mt={1.5}>
            <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.light', fontSize: 11 }}>
              {listing.vendor.name?.[0]}
            </Avatar>
            <Typography variant="caption" fontWeight={500}>{listing.vendor.name}</Typography>
            {listing.vendor.averageRating > 0 && (
              <Box display="flex" alignItems="center" gap={0.3}>
                <Rating value={listing.vendor.averageRating} size="small" readOnly precision={0.5} sx={{ fontSize: 12 }} />
                <Typography variant="caption" color="text.secondary">
                  {listing.vendor.averageRating.toFixed(1)}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          component={Link}
          to={`/listings/${listing._id}`}
          variant={listing.status === 'active' ? 'contained' : 'outlined'}
          size="small"
          fullWidth
          disabled={listing.status !== 'active'}
        >
          {listing.status === 'active' ? 'View & request' : listing.status}
        </Button>
      </CardActions>
    </Card>
  );
}
