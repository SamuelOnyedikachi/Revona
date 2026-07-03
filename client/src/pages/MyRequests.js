import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Card, Chip, Button,
  CircularProgress, Grid, Divider, Alert, Tabs, Tab,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ChatIcon from '@mui/icons-material/Chat';
import StarIcon from '@mui/icons-material/Star';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import ChatWindow from '../components/chat/ChatWindow';
import RatingDialog from '../components/common/RatingDialog';
import EmptyState from '../components/common/EmptyState';
import ListAltIcon from '@mui/icons-material/ListAlt';

const STATUS_COLOR = {
  pending: 'warning', accepted: 'success',
  completed: 'default', rejected: 'error', cancelled: 'error',
};

const STATUS_TABS = ['all', 'pending', 'accepted', 'completed'];

export default function MyRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null); // request object
  const [ratingTarget, setRatingTarget] = useState(null); // { requestId, rateeName, rateeRole }
  const [tab, setTab] = useState(0);
  const [actionLoading, setActionLoading] = useState('');

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/requests');
      setRequests(data.data.requests);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const updateStatus = async (id, status) => {
    setActionLoading(id + status);
    try {
      await api.patch(`/requests/${id}/status`, { status });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating request');
    } finally {
      setActionLoading('');
    }
  };

  const filtered = requests.filter((r) => {
    if (tab === 0) return true;
    return r.status === STATUS_TABS[tab];
  });

  const getOtherUser = (r) =>
    user.role === 'vendor' ? r.requester : r.vendor;

  if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h4" fontWeight={700} mb={1}>
        {user.role === 'vendor' ? 'Incoming requests' : 'My requests'}
      </Typography>
      <Typography color="text.secondary" mb={4}>
        {user.role === 'vendor'
          ? 'Manage pickup requests from farmers and composters'
          : 'Track your waste pickup requests'}
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        {STATUS_TABS.map((s, i) => (
          <Tab
            key={s}
            label={
              <Box display="flex" alignItems="center" gap={1}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                <Chip
                  label={s === 'all' ? requests.length : requests.filter((r) => r.status === s).length}
                  size="small"
                  sx={{ height: 18, fontSize: 10 }}
                />
              </Box>
            }
          />
        ))}
      </Tabs>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ListAltIcon}
          title="No requests here"
          subtitle="Requests in this status will appear here."
        />
      ) : (
        <Grid container spacing={3}>
          {/* Request list */}
          <Grid item xs={12} md={activeChat ? 5 : 12}>
            <Box display="flex" flexDirection="column" gap={2}>
              {filtered.map((r) => {
                const other = getOtherUser(r);
                const isBusy = actionLoading.startsWith(r._id);
                const isSelected = activeChat?._id === r._id;

                return (
                  <Card
                    key={r._id}
                    sx={{
                      p: 3,
                      border: '1.5px solid',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                    }}
                    onClick={() => setActiveChat(isSelected ? null : r)}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                      <Box flexGrow={1}>
                        <Typography variant="h6" fontWeight={600} noWrap>
                          {r.listing?.title || 'Listing'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {r.quantityRequestedKg} kg ·{' '}
                          {user.role === 'vendor'
                            ? `From: ${other?.name} (${other?.role})`
                            : `Vendor: ${other?.name}`}
                        </Typography>
                        {r.message && (
                          <Typography variant="body2" mt={0.5} sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                            "{r.message}"
                          </Typography>
                        )}
                      </Box>
                      <Chip label={r.status} color={STATUS_COLOR[r.status] || 'default'} size="small" />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box display="flex" gap={1} flexWrap="wrap" onClick={(e) => e.stopPropagation()}>
                      {/* Chat button — available on accepted requests */}
                      {r.status === 'accepted' && (
                        <Button
                          size="small"
                          variant={isSelected ? 'contained' : 'outlined'}
                          startIcon={<ChatIcon />}
                          onClick={(e) => { e.stopPropagation(); setActiveChat(isSelected ? null : r); }}
                        >
                          Chat
                        </Button>
                      )}

                      {/* Vendor actions */}
                      {user.role === 'vendor' && r.status === 'pending' && (
                        <>
                          <Button
                            size="small" variant="contained" color="success"
                            startIcon={isBusy ? <CircularProgress size={14} color="inherit" /> : <CheckCircleIcon />}
                            disabled={isBusy}
                            onClick={() => updateStatus(r._id, 'accepted')}
                          >
                            Accept
                          </Button>
                          <Button
                            size="small" variant="outlined" color="error"
                            startIcon={<CancelIcon />}
                            disabled={isBusy}
                            onClick={() => updateStatus(r._id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {user.role === 'vendor' && r.status === 'accepted' && (
                        <Button
                          size="small" variant="contained"
                          disabled={isBusy}
                          onClick={() => updateStatus(r._id, 'completed')}
                        >
                          {isBusy ? <CircularProgress size={14} color="inherit" /> : 'Mark completed'}
                        </Button>
                      )}

                      {/* Rate button — show if completed and not yet rated */}
                      {r.status === 'completed' && (
                        !(user.role === 'vendor' ? r.vendorRated : r.requesterRated)
                      ) && (
                        <Button
                          size="small" variant="outlined" color="warning"
                          startIcon={<StarIcon />}
                          onClick={() => setRatingTarget({
                            requestId: r._id,
                            rateeName: other?.name,
                            rateeRole: other?.role,
                          })}
                        >
                          Rate exchange
                        </Button>
                      )}
                    </Box>
                  </Card>
                );
              })}
            </Box>
          </Grid>

          {/* Chat panel */}
          {activeChat && (
            <Grid item xs={12} md={7}>
              <Box sx={{ position: 'sticky', top: 80 }}>
                <Typography variant="subtitle2" color="text.secondary" mb={1.5}>
                  💬 Chat with {getOtherUser(activeChat)?.name}
                </Typography>
                <ChatWindow
                  requestId={activeChat._id}
                  otherUser={getOtherUser(activeChat)}
                  request={activeChat}
                />
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {/* Rating dialog */}
      {ratingTarget && (
        <RatingDialog
          open
          onClose={() => setRatingTarget(null)}
          requestId={ratingTarget.requestId}
          rateeName={ratingTarget.rateeName}
          rateeRole={ratingTarget.rateeRole}
          onSuccess={fetchRequests}
        />
      )}
    </Container>
  );
}
