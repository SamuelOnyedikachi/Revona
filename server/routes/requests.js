const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Listing = require('../models/Listing');
const { protect, restrictTo } = require('../middleware/auth');
const { AppError } = require('../utils/AppError');

// POST /api/requests — farmer/composter sends pickup request
router.post('/', protect, restrictTo('farmer', 'composter'), async (req, res) => {
  const { listingId, message, proposedPickupDate, quantityRequestedKg } = req.body;

  const listing = await Listing.findById(listingId);
  if (!listing) throw new AppError('Listing not found', 404);
  if (listing.status !== 'active') throw new AppError('Listing is no longer available', 400);

  // Prevent requesting your own listing
  if (listing.vendor.toString() === req.user.id) {
    throw new AppError('Cannot request your own listing', 400);
  }

  const request = await Request.create({
    listing: listingId,
    requester: req.user.id,
    vendor: listing.vendor,
    message,
    proposedPickupDate,
    quantityRequestedKg,
  });

  // Mark listing as reserved
  listing.status = 'reserved';
  await listing.save();

  res.status(201).json({ status: 'success', data: { request } });
});

// GET /api/requests — get requests relevant to logged-in user
router.get('/', protect, async (req, res) => {
  const filter =
    req.user.role === 'vendor'
      ? { vendor: req.user.id }
      : { requester: req.user.id };

  const requests = await Request.find(filter)
    .populate('listing', 'title quantityKg category targetUse photos')
    .populate('vendor', 'name averageRating')
    .populate('requester', 'name averageRating role')
    .sort({ createdAt: -1 });

  res.json({ status: 'success', data: { requests } });
});

// PATCH /api/requests/:id/status — vendor accepts or rejects
router.patch('/:id/status', protect, restrictTo('vendor', 'admin'), async (req, res) => {
  const { status } = req.body; // 'accepted' | 'rejected' | 'completed'
  const request = await Request.findById(req.params.id).populate('listing');

  if (!request) throw new AppError('Request not found', 404);
  if (request.vendor.toString() !== req.user.id) {
    throw new AppError('Not authorised', 403);
  }

  request.status = status;
  await request.save();

  // If rejected, free the listing back to active
  if (status === 'rejected') {
    await Listing.findByIdAndUpdate(request.listing._id, { status: 'active' });
  }
  // If completed, mark listing as completed
  if (status === 'completed') {
    await Listing.findByIdAndUpdate(request.listing._id, { status: 'completed' });
  }

  res.json({ status: 'success', data: { request } });
});

module.exports = router;
