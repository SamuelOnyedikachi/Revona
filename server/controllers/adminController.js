const User = require('../models/User');
const Listing = require('../models/Listing');
const Request = require('../models/Request');
const Rating = require('../models/Rating');
const { AppError } = require('../utils/AppError');

// GET /api/admin/stats — platform overview
exports.getStats = async (req, res) => {
  const [users, listings, requests, ratings] = await Promise.all([
    User.countDocuments(),
    Listing.countDocuments(),
    Request.countDocuments(),
    Rating.countDocuments({ isRevealed: true }),
  ]);

  const byRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);

  const byListingStatus = await Listing.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const totalWasteKg = await Listing.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$quantityKg' } } },
  ]);

  res.json({
    status: 'success',
    data: {
      totals: { users, listings, requests, ratings },
      usersByRole: byRole,
      listingsByStatus: byListingStatus,
      totalWasteKgDiverted: totalWasteKg[0]?.total || 0,
    },
  });
};

// GET /api/admin/users — paginated user list
exports.getUsers = async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.json({ status: 'success', total, pages: Math.ceil(total / limit), data: { users } });
};

// PATCH /api/admin/users/:id/verify — toggle verified badge
exports.verifyUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);

  const hasVerified = user.badges.includes('verified');
  if (hasVerified) {
    user.badges = user.badges.filter((b) => b !== 'verified');
    user.isVerified = false;
  } else {
    user.badges.push('verified');
    user.isVerified = true;
  }
  await user.save();

  res.json({ status: 'success', data: { user } });
};

// PATCH /api/admin/users/:id/deactivate — toggle account active/inactive
exports.toggleUserActive = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'admin') throw new AppError('Cannot deactivate another admin', 403);

  user.isActive = !user.isActive;
  await user.save();
  res.json({ status: 'success', data: { user } });
};

// GET /api/admin/listings — all listings for moderation
exports.getListings = async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = status ? { status } : {};

  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .populate('vendor', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Listing.countDocuments(filter),
  ]);

  res.json({ status: 'success', total, data: { listings } });
};

// DELETE /api/admin/listings/:id — remove listing (moderation)
exports.deleteListing = async (req, res) => {
  const listing = await Listing.findByIdAndDelete(req.params.id);
  if (!listing) throw new AppError('Listing not found', 404);
  res.json({ status: 'success', message: 'Listing removed' });
};

// GET /api/admin/reports — flagged content (placeholder for Sprint 7)
exports.getReports = async (req, res) => {
  res.json({ status: 'success', data: { reports: [] } });
};
