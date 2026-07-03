const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Request = require('../models/Request');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { AppError } = require('../utils/AppError');
const { awardBadges } = require('../utils/badges');

// POST /api/ratings — submit a rating after a completed request
router.post('/', protect, async (req, res) => {
  const { requestId, score, comment } = req.body;

  const request = await Request.findById(requestId);
  if (!request) throw new AppError('Request not found', 404);
  if (request.status !== 'completed') throw new AppError('Request not completed yet', 400);

  const isVendor = request.vendor.toString() === req.user.id;
  const isRequester = request.requester.toString() === req.user.id;
  if (!isVendor && !isRequester) throw new AppError('Not part of this transaction', 403);

  const rateeId = isVendor ? request.requester : request.vendor;

  // Prevent duplicate rating
  const existing = await Rating.findOne({ request: requestId, rater: req.user.id });
  if (existing) throw new AppError('You have already rated this transaction', 409);

  const rating = await Rating.create({
    request: requestId,
    rater: req.user.id,
    ratee: rateeId,
    score,
    comment,
  });

  // Mark who has rated on the request
  if (isVendor) request.vendorRated = true;
  else request.requesterRated = true;
  await request.save();

  // Double-blind reveal: if BOTH parties have now rated, reveal both and update averages
  if (request.vendorRated && request.requesterRated) {
    await Rating.updateMany({ request: requestId }, { isRevealed: true });

    // Recalculate average rating for both parties
    for (const userId of [request.vendor, request.requester]) {
      const allRatings = await Rating.find({ ratee: userId, isRevealed: true });
      const avg = allRatings.reduce((s, r) => s + r.score, 0) / allRatings.length;
      await awardBadges(userId);
      await User.findByIdAndUpdate(userId, {
        averageRating: Math.round(avg * 10) / 10,
        totalRatings: allRatings.length,
      });
    }
  }

  res.status(201).json({ status: 'success', data: { rating } });
});

// GET /api/ratings/user/:userId — get revealed ratings for a user
router.get('/user/:userId', async (req, res) => {
  const ratings = await Rating.find({
    ratee: req.params.userId,
    isRevealed: true,
  })
    .populate('rater', 'name role')
    .sort({ createdAt: -1 });

  res.json({ status: 'success', data: { ratings } });
});

module.exports = router;
