const User = require('../models/User');
const Listing = require('../models/Listing');

/**
 * Recalculates and awards badges for a given user.
 * Called after a rating is revealed or a listing is completed.
 *
 * Badge rules:
 *  - verified:      isVerified flag (set manually by admin)
 *  - reliable:      averageRating >= 4.5 AND totalRatings >= 10
 *  - top_supplier:  vendor with >= 10 completed listings
 *  - eco_champion:  total waste diverted >= 500 kg
 */
const awardBadges = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const earned = new Set(user.badges || []);

  // reliable
  if (user.averageRating >= 4.5 && user.totalRatings >= 10) {
    earned.add('reliable');
  }

  // top_supplier & eco_champion (vendors only)
  if (user.role === 'vendor') {
    const completedListings = await Listing.find({
      vendor: userId,
      status: 'completed',
    });

    if (completedListings.length >= 10) earned.add('top_supplier');

    const totalKg = completedListings.reduce((s, l) => s + l.quantityKg, 0);
    if (totalKg >= 500) earned.add('eco_champion');
  }

  const badgesArray = Array.from(earned);
  if (JSON.stringify(badgesArray.sort()) !== JSON.stringify((user.badges || []).slice().sort())) {
    user.badges = badgesArray;
    await user.save();
  }
};

module.exports = { awardBadges };
