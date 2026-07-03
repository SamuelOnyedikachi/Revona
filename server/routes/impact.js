const express = require('express');
const router = express.Router();
const { getPlatformImpact, getMyImpact, estimateImpact } = require('../controllers/impactController');
const { protect } = require('../middleware/auth');

router.get('/platform', getPlatformImpact);
router.get('/me', protect, getMyImpact);
router.post('/estimate', estimateImpact);

module.exports = router;

// POST /api/impact/sus  — store a SUS survey response
const SUSResponse = require('../models/SUSResponse');
router.post('/sus', protect, async (req, res) => {
  const { score, answers } = req.body;
  await SUSResponse.create({
    user: req.user.id,
    score,
    answers,
    userRole: req.user.role,
    userAgent: req.headers['user-agent'],
  });
  res.status(201).json({ status: 'success', message: 'SUS response recorded' });
});

// GET /api/impact/sus  — admin: retrieve all SUS scores + average
router.get('/sus', protect, async (req, res) => {
  const responses = await SUSResponse.find()
    .populate('user', 'name role')
    .sort({ createdAt: -1 });
  const avg = responses.length
    ? Math.round(responses.reduce((s, r) => s + r.score, 0) / responses.length)
    : 0;
  res.json({
    status: 'success',
    data: { responses, averageScore: avg, count: responses.length },
  });
});
