const {
  connectTestDB, clearTestDB, disconnectTestDB, makeUser,
} = require('./helpers');
const { awardBadges } = require('../utils/badges');
const Listing = require('../models/Listing');
const User = require('../models/User');

process.env.JWT_SECRET = 'test_secret_key';
process.env.NODE_ENV = 'test';

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(disconnectTestDB);

const makeCompletedListings = async (vendorId, count, quantityKg = 10) => {
  const docs = Array.from({ length: count }, (_, i) => ({
    vendor: vendorId,
    title: `Listing ${i}`,
    category: 'fruit_waste',
    targetUse: 'compost',
    quantityKg,
    status: 'completed',
    availableUntil: new Date(Date.now() + 86400000),
    location: { type: 'Point', coordinates: [3.38, 6.52] },
  }));
  return Listing.insertMany(docs);
};

describe('awardBadges()', () => {
  it('awards "reliable" badge when rating >= 4.5 with 10+ reviews', async () => {
    const vendor = await makeUser({ role: 'vendor', email: 'rel@b.ng' });
    await User.findByIdAndUpdate(vendor._id, { averageRating: 4.7, totalRatings: 12 });
    await awardBadges(vendor._id);
    const updated = await User.findById(vendor._id);
    expect(updated.badges).toContain('reliable');
  });

  it('does NOT award "reliable" if rating < 4.5', async () => {
    const vendor = await makeUser({ role: 'vendor', email: 'norel@b.ng' });
    await User.findByIdAndUpdate(vendor._id, { averageRating: 3.9, totalRatings: 15 });
    await awardBadges(vendor._id);
    const updated = await User.findById(vendor._id);
    expect(updated.badges).not.toContain('reliable');
  });

  it('does NOT award "reliable" if fewer than 10 ratings', async () => {
    const vendor = await makeUser({ role: 'vendor', email: 'norel2@b.ng' });
    await User.findByIdAndUpdate(vendor._id, { averageRating: 5.0, totalRatings: 7 });
    await awardBadges(vendor._id);
    const updated = await User.findById(vendor._id);
    expect(updated.badges).not.toContain('reliable');
  });

  it('awards "top_supplier" to vendor with 10+ completed listings', async () => {
    const vendor = await makeUser({ role: 'vendor', email: 'top@b.ng' });
    await makeCompletedListings(vendor._id, 10);
    await awardBadges(vendor._id);
    const updated = await User.findById(vendor._id);
    expect(updated.badges).toContain('top_supplier');
  });

  it('does NOT award "top_supplier" with fewer than 10 listings', async () => {
    const vendor = await makeUser({ role: 'vendor', email: 'notop@b.ng' });
    await makeCompletedListings(vendor._id, 8);
    await awardBadges(vendor._id);
    const updated = await User.findById(vendor._id);
    expect(updated.badges).not.toContain('top_supplier');
  });

  it('awards "eco_champion" when 500+ kg diverted', async () => {
    const vendor = await makeUser({ role: 'vendor', email: 'eco@b.ng' });
    // 10 listings × 55 kg = 550 kg total
    await makeCompletedListings(vendor._id, 10, 55);
    await awardBadges(vendor._id);
    const updated = await User.findById(vendor._id);
    expect(updated.badges).toContain('eco_champion');
  });

  it('does NOT award "eco_champion" below 500 kg', async () => {
    const vendor = await makeUser({ role: 'vendor', email: 'noeco@b.ng' });
    await makeCompletedListings(vendor._id, 5, 40); // 200 kg total
    await awardBadges(vendor._id);
    const updated = await User.findById(vendor._id);
    expect(updated.badges).not.toContain('eco_champion');
  });

  it('can award multiple badges at once', async () => {
    const vendor = await makeUser({ role: 'vendor', email: 'multi@b.ng' });
    await User.findByIdAndUpdate(vendor._id, { averageRating: 4.9, totalRatings: 20 });
    await makeCompletedListings(vendor._id, 12, 60); // 720 kg, 12 listings
    await awardBadges(vendor._id);
    const updated = await User.findById(vendor._id);
    expect(updated.badges).toContain('reliable');
    expect(updated.badges).toContain('top_supplier');
    expect(updated.badges).toContain('eco_champion');
  });

  it('does not duplicate badges on repeated calls', async () => {
    const vendor = await makeUser({ role: 'vendor', email: 'dup@b.ng' });
    await User.findByIdAndUpdate(vendor._id, { averageRating: 4.8, totalRatings: 11 });
    await awardBadges(vendor._id);
    await awardBadges(vendor._id); // called twice
    const updated = await User.findById(vendor._id);
    const relCount = updated.badges.filter((b) => b === 'reliable').length;
    expect(relCount).toBe(1);
  });
});
