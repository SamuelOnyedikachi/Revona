import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import StarIcon from '@mui/icons-material/Star';
import EcoIcon from '@mui/icons-material/EnergySavingsLeaf';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

const BADGE_CONFIG = {
  verified: {
    label: 'Verified',
    icon: <VerifiedIcon sx={{ fontSize: '14px !important' }} />,
    color: 'success',
    tip: 'Identity verified by ReVora',
  },
  top_supplier: {
    label: 'Top Supplier',
    icon: <StarIcon sx={{ fontSize: '14px !important' }} />,
    color: 'warning',
    tip: 'Consistently high-quality waste listings',
  },
  eco_champion: {
    label: 'Eco Champion',
    icon: <EcoIcon sx={{ fontSize: '14px !important' }} />,
    color: 'primary',
    tip: 'Diverted over 500 kg from landfill',
  },
  reliable: {
    label: 'Reliable',
    icon: <ThumbUpIcon sx={{ fontSize: '14px !important' }} />,
    color: 'info',
    tip: 'Rated 4.5+ with 10 or more exchanges',
  },
};

export default function BadgeChip({ badge, size = 'small' }) {
  const config = BADGE_CONFIG[badge];
  if (!config) return null;

  return (
    <Tooltip title={config.tip} arrow placement="top">
      <Chip
        icon={config.icon}
        label={config.label}
        size={size}
        color={config.color}
        variant="outlined"
        sx={{ fontWeight: 600, cursor: 'help' }}
      />
    </Tooltip>
  );
}
