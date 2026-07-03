const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { AppError } = require('../utils/AppError');

// GET /api/users/:id — public profile
router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id).select(
    'name role bio avatar averageRating totalRatings badges location.city location.address createdAt'
  );
  if (!user) throw new AppError('User not found', 404);
  res.json({ status: 'success', data: { user } });
});

// PUT /api/users/me — update own profile
router.put('/me', protect, async (req, res) => {
  const ALLOWED = ['name', 'bio', 'phone', 'avatar', 'location'];
  const updates = {};
  ALLOWED.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });
  res.json({ status: 'success', data: { user } });
});

module.exports = router;
