import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, Avatar, Chip, Paper, CircularProgress, Grid, Rating } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import api from '../api';

const BADGE_COLOR = { verified: 'success', top_supplier: 'warning', eco_champion: 'info', reliable: 'primary' };

export default function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/users/${id}`),
      api.get(`/ratings/user/${id}`),
    ]).then(([uRes, rRes]) => {
      setUser(uRes.data.data.user);
      setRatings(rRes.data.data.ratings);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;
  if (!user) return <Container sx={{ py: 5 }}><Typography>User not found</Typography></Container>;

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box display="flex" gap={3} alignItems="center" flexWrap="wrap">
          <Avatar src={user.avatar} sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32 }}>
            {user.name?.[0]}
          </Avatar>
          <Box flexGrow={1}>
            <Typography variant="h4" fontWeight={700}>{user.name}</Typography>
            <Box display="flex" gap={1} mt={1} flexWrap="wrap">
              <Chip label={user.role} color="primary" size="small" />
              {user.badges?.map((b) => (
                <Chip key={b} icon={<VerifiedIcon />} label={b.replace('_', ' ')} color={BADGE_COLOR[b] || 'default'} size="small" />
              ))}
            </Box>
            {user.averageRating > 0 && (
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <Rating value={user.averageRating} precision={0.1} readOnly size="small" />
                <Typography variant="body2" color="text.secondary">
                  {user.averageRating.toFixed(1)} ({user.totalRatings} reviews)
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
        {user.bio && <Typography color="text.secondary" mt={3}>{user.bio}</Typography>}
        <Typography variant="caption" color="text.secondary" mt={2} display="block">
          Member since {new Date(user.createdAt).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })}
          {user.location?.city && ` · ${user.location.city}`}
        </Typography>
      </Paper>

      <Typography variant="h5" fontWeight={600} mb={3}>Reviews ({ratings.length})</Typography>
      {ratings.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f8faf9' }}>
          <Typography color="text.secondary">No reviews yet</Typography>
        </Paper>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {ratings.map((r) => (
            <Paper key={r._id} sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>{r.rater?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{r.rater?.role}</Typography>
                </Box>
                <Rating value={r.score} readOnly size="small" />
              </Box>
              {r.comment && <Typography variant="body2" mt={1.5} color="text.secondary">{r.comment}</Typography>}
              <Typography variant="caption" color="text.disabled" mt={1} display="block">
                {new Date(r.createdAt).toLocaleDateString()}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}
    </Container>
  );
}
