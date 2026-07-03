import { useState, useEffect } from 'react';
import api from '../api';

const SUS_KEY = 'revora_sus_submitted';
const TRIGGER_AFTER = 3; // completed requests before survey fires

/**
 * useSUS
 * Returns { susOpen, closeSUS, submitSUS }
 * Drop <SUSModal open={susOpen} onClose={closeSUS} onSubmit={submitSUS} />
 * anywhere in the authenticated layout.
 */
export default function useSUS(user) {
  const [susOpen, setSusOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Don't show if already submitted
    const already = localStorage.getItem(SUS_KEY);
    if (already) return;

    // Check completed request count
    const check = async () => {
      try {
        const { data } = await api.get('/requests');
        const completed = data.data.requests.filter((r) => r.status === 'completed');
        if (completed.length >= TRIGGER_AFTER) {
          // Small delay so it doesn't pop up immediately on page load
          setTimeout(() => setSusOpen(true), 2500);
        }
      } catch {
        // silent — survey is non-critical
      }
    };

    check();
  }, [user]);

  const closeSUS = () => setSusOpen(false);

  const submitSUS = (score, answers) => {
    // POST to backend for record-keeping (Sprint 7 pilot data)
    api.post('/impact/sus', { score, answers }).catch(() => {});
    setSusOpen(false);
  };

  return { susOpen, closeSUS, submitSUS };
}
