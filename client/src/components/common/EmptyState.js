import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

export default function EmptyState({ icon, title, subtitle, actionLabel, onAction }) {
  const Icon = icon || InboxIcon;
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 3,
        bgcolor: '#f8faf9',
        borderRadius: 3,
        border: '1.5px dashed',
        borderColor: 'divider',
      }}
    >
      <Icon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6" fontWeight={600} gutterBottom>{title}</Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" mb={3}>{subtitle}</Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction}>{actionLabel}</Button>
      )}
    </Box>
  );
}
