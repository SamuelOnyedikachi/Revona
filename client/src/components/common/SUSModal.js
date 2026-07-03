import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, Slider, Paper,
  LinearProgress, Chip, Fade, CircularProgress,
} from '@mui/material';
import EcoIcon from '@mui/icons-material/EnergySavingsLeaf';

// Standard SUS questions (Brooke, 1996)
const SUS_QUESTIONS = [
  { id: 1, text: 'I think that I would like to use ReVora frequently.' },
  { id: 2, text: 'I found ReVora unnecessarily complex.', reversed: true },
  { id: 3, text: 'I thought ReVora was easy to use.' },
  { id: 4, text: 'I think I would need the support of a technical person to use ReVora.', reversed: true },
  { id: 5, text: 'I found the various features in ReVora were well integrated.' },
  { id: 6, text: 'I thought there was too much inconsistency in ReVora.', reversed: true },
  { id: 7, text: 'I would imagine that most people would learn to use ReVora very quickly.' },
  { id: 8, text: 'I found ReVora very awkward to use.', reversed: true },
  { id: 9, text: 'I felt very confident using ReVora.' },
  { id: 10, text: 'I needed to learn a lot of things before I could get going with ReVora.', reversed: true },
];

const SCALE_LABELS = {
  1: 'Strongly disagree',
  2: 'Disagree',
  3: 'Neutral',
  4: 'Agree',
  5: 'Strongly agree',
};

/**
 * Calculate SUS score from answers map { questionId: 1-5 }
 * Standard formula: sum of (score - 1) for odd, (5 - score) for even, then × 2.5
 */
const calcSUS = (answers) => {
  let total = 0;
  SUS_QUESTIONS.forEach((q) => {
    const val = answers[q.id] || 3;
    total += q.reversed ? (5 - val) : (val - 1);
  });
  return Math.round(total * 2.5);
};

const getSUSGrade = (score) => {
  if (score >= 85) return { grade: 'A', label: 'Excellent', color: '#2d6a4f' };
  if (score >= 71) return { grade: 'B', label: 'Good',      color: '#52b788' };
  if (score >= 51) return { grade: 'C', label: 'OK',        color: '#f4a261' };
  if (score >= 35) return { grade: 'D', label: 'Poor',      color: '#e76f51' };
  return                  { grade: 'F', label: 'Awful',     color: '#c62828' };
};

const LOCAL_KEY = 'revora_sus_submitted';

/**
 * SUSModal
 * Shown automatically after a user completes their 3rd exchange, or manually via props.
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   onSubmit?: (score, answers) => void   — optional callback for logging
 */
export default function SUSModal({ open, onClose, onSubmit }) {
  const [step, setStep] = useState(0);          // 0 = intro, 1–10 = questions, 11 = result
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(null);

  // Reset on open
  useEffect(() => {
    if (open) { setStep(0); setAnswers({}); setScore(null); }
  }, [open]);

  const current = SUS_QUESTIONS[step - 1];
  const progress = step === 0 ? 0 : Math.round((step / 10) * 100);

  const handleAnswer = (val) => {
    setAnswers((prev) => ({ ...prev, [current.id]: val }));
  };

  const handleNext = () => {
    if (step < 10) {
      setStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const handleSubmit = async () => {
    setSubmitting(true);
    const finalScore = calcSUS(answers);
    setScore(finalScore);

    try {
      onSubmit?.(finalScore, answers);
      localStorage.setItem(LOCAL_KEY, JSON.stringify({ score: finalScore, date: new Date() }));
    } catch (err) {
      console.error('SUS submit error:', err);
    } finally {
      setSubmitting(false);
      setStep(11);
    }
  };

  const grade = score !== null ? getSUSGrade(score) : null;
  const allAnswered = SUS_QUESTIONS.every((q) => answers[q.id]);

  return (
    <Dialog
      open={open}
      onClose={step === 11 ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'visible' } }}
    >
      {/* ── Intro ── */}
      {step === 0 && (
        <>
          <DialogTitle sx={{ pb: 0 }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <EcoIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>Help us improve ReVora</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography color="text.secondary" mt={1.5} lineHeight={1.7}>
              This 10-question usability survey takes under 2 minutes. Your feedback directly
              improves the platform for market vendors, farmers, and composters across Nigeria.
            </Typography>
            <Paper sx={{ p: 2.5, mt: 2.5, bgcolor: '#f0faf4', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                For each statement, rate your agreement from{' '}
                <strong>1 (Strongly disagree)</strong> to <strong>5 (Strongly agree)</strong>.
                There are no right or wrong answers.
              </Typography>
            </Paper>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={onClose} variant="outlined">Maybe later</Button>
            <Button onClick={() => setStep(1)} variant="contained">Start survey</Button>
          </DialogActions>
        </>
      )}

      {/* ── Questions ── */}
      {step >= 1 && step <= 10 && current && (
        <>
          <DialogTitle sx={{ pb: 0 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" color="text.secondary">
                Question {step} of 10
              </Typography>
              <Chip label={`${progress}%`} size="small" color="primary" variant="outlined" />
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ mt: 1.5, height: 6, borderRadius: 3 }}
            />
          </DialogTitle>

          <DialogContent sx={{ pt: 3, pb: 1 }}>
            <Fade in key={step}>
              <Box>
                <Typography variant="h6" fontWeight={600} mb={4} lineHeight={1.5}>
                  {current.text}
                </Typography>

                {/* Slider */}
                <Box px={1}>
                  <Slider
                    value={answers[current.id] || 3}
                    onChange={(_, val) => handleAnswer(val)}
                    min={1} max={5} step={1}
                    marks={[1, 2, 3, 4, 5].map((v) => ({
                      value: v,
                      label: (
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: 10,
                            fontWeight: answers[current.id] === v ? 700 : 400,
                            color: answers[current.id] === v ? 'primary.main' : 'text.secondary',
                          }}
                        >
                          {v}
                        </Typography>
                      ),
                    }))}
                    sx={{ color: 'primary.main' }}
                  />
                  <Box display="flex" justifyContent="space-between" mt={0.5}>
                    <Typography variant="caption" color="text.secondary">Strongly disagree</Typography>
                    <Typography variant="caption" color="text.secondary">Strongly agree</Typography>
                  </Box>
                </Box>

                {answers[current.id] && (
                  <Box textAlign="center" mt={2}>
                    <Chip
                      label={SCALE_LABELS[answers[current.id]]}
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                )}
              </Box>
            </Fade>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button onClick={handleBack} variant="outlined" disabled={step === 1}>Back</Button>
            <Button
              onClick={handleNext}
              variant="contained"
              disabled={!answers[current.id] || submitting}
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {step < 10 ? 'Next' : 'Submit'}
            </Button>
          </DialogActions>
        </>
      )}

      {/* ── Result ── */}
      {step === 11 && grade && (
        <>
          <DialogContent sx={{ pt: 4, pb: 3, textAlign: 'center' }}>
            {/* Score circle */}
            <Box
              sx={{
                width: 120, height: 120,
                borderRadius: '50%',
                bgcolor: grade.color + '22',
                border: `4px solid ${grade.color}`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 3,
              }}
            >
              <Typography variant="h3" fontWeight={800} sx={{ color: grade.color, lineHeight: 1 }}>
                {score}
              </Typography>
              <Typography variant="caption" sx={{ color: grade.color, fontWeight: 700 }}>
                / 100
              </Typography>
            </Box>

            <Chip
              label={`Grade ${grade.grade} — ${grade.label}`}
              sx={{ bgcolor: grade.color, color: '#fff', fontWeight: 700, fontSize: 14, px: 2, py: 2.5, mb: 2.5 }}
            />

            <Typography variant="h6" fontWeight={700} mb={1}>
              Thank you for your feedback!
            </Typography>
            <Typography color="text.secondary" lineHeight={1.7}>
              Your SUS score of <strong>{score}/100</strong> helps us measure usability against our
              target of <strong>70+</strong>. Every response shapes ReVora's next sprint.
            </Typography>

            {score >= 70 && (
              <Paper sx={{ p: 2, mt: 3, bgcolor: '#f0faf4', borderRadius: 2 }}>
                <Typography variant="body2" color="primary.dark" fontWeight={500}>
                  🎉 ReVora meets the usability benchmark — target achieved!
                </Typography>
              </Paper>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
            <Button onClick={onClose} variant="contained" size="large">Done</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
