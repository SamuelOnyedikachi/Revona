import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Rating, TextField, Button,
  CircularProgress, Alert, Chip,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import api from '../../api';

const LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very good',
  5: 'Excellent',
};

/**
 * RatingDialog
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   requestId: string
 *   rateeName: string
 *   rateeRole: string
 *   onSuccess: () => void
 */
export default function RatingDialog({
  open, onClose, requestId, rateeName, rateeRole, onSuccess,
}) {
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(-1);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!score) { setError('Please select a rating'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/ratings', { requestId, score, comment });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const displayScore = hover !== -1 ? hover : score;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 0 }}>
        <Typography variant="h6" fontWeight={700}>Rate your exchange</Typography>
        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
          <Typography variant="body2" color="text.secondary">How was your experience with</Typography>
          <Chip label={rateeName} size="small" color="primary" />
          <Chip label={rateeRole} size="small" variant="outlined" />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Star rating */}
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Rating
            value={score}
            onChange={(_, val) => setScore(val)}
            onChangeActive={(_, val) => setHover(val)}
            size="large"
            sx={{ fontSize: 44 }}
            emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />}
          />
          <Typography
            variant="subtitle1"
            fontWeight={600}
            color={score || hover > 0 ? 'primary.main' : 'text.disabled'}
            mt={1}
            sx={{ minHeight: 28 }}
          >
            {displayScore > 0 ? LABELS[displayScore] : 'Select a rating'}
          </Typography>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Leave a comment (optional)"
          placeholder="Describe your experience — punctuality, quality, communication…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          inputProps={{ maxLength: 300 }}
          helperText={`${comment.length}/300`}
        />

        <Box mt={2} p={2} bgcolor="#f0faf4" borderRadius={2}>
          <Typography variant="caption" color="text.secondary">
            🔒 <strong>Double-blind rating:</strong> Your rating will only be revealed once the other
            party has also submitted theirs — keeping both reviews honest and unbiased.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !score}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Submit rating
        </Button>
      </DialogActions>
    </Dialog>
  );
}
