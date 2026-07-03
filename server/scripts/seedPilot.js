/**
 * ReVora pilot seed script
 * Usage: node server/scripts/seedPilot.js
 *
 * Creates realistic test users, listings, requests, and ratings
 * that simulate a 4-week pilot in Lagos, Nigeria.
 *
 * Run ONCE against your dev/staging MongoDB only.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Request = require('../models/Request');
const Rating = require('../models/Rating');

// ── Seed data ──────────────────────────────────────────────
const VENDORS = [
  { name: 'Chidinma Okafor',  email: 'chidinma@pilot.ng',  phone: '+2348012345678', city: 'Mile 12 Market',      coords: [3.3935, 6.6018] },
  { name: 'Emeka Nwachukwu',  email: 'emeka@pilot.ng',     phone: '+2348023456789', city: 'Oyingbo Market',       coords: [3.3884, 6.4550] },
  { name: 'Fatima Abubakar',  email: 'fatima@pilot.ng',    phone: '+2348034567890', city: 'Ketu Market',          coords: [3.3896, 6.5773] },
  { name: 'Adaeze Eze',       email: 'adaeze@pilot.ng',    phone: '+2348045678901', city: 'Agege Market',         coords: [3.3235, 6.6186] },
];

const FARMERS = [
  { name: 'Tunde Adeyemi',    email: 'tunde@pilot.ng',     phone: '+2348056789012', city: 'Ikorodu',              coords: [3.5093, 6.6194] },
  { name: 'Ngozi Obi',        email: 'ngozi@pilot.ng',     phone: '+2348067890123', city: 'Badagry',              coords: [2.8792, 6.4131] },
];

const COMPOSTERS = [
  { name: 'Seun Bakare',      email: 'seun@pilot.ng',      phone: '+2348078901234', city: 'Alimosho',             coords: [3.2654, 6.6127] },
];

const LISTING_TEMPLATES = [
  { title: 'Mixed tomato & pepper offcuts',   category: 'vegetable_waste', targetUse: 'compost',      qty: 45 },
  { title: 'Overripe mango surplus',           category: 'fruit_waste',     targetUse: 'animal_feed',  qty: 60 },
  { title: 'Watermelon rinds — large batch',   category: 'fruit_waste',     targetUse: 'both',         qty: 80 },
  { title: 'Cabbage and lettuce trimmings',    category: 'vegetable_waste', targetUse: 'compost',      qty: 35 },
  { title: 'Pineapple cores & skins',          category: 'fruit_waste',     targetUse: 'animal_feed',  qty: 55 },
  { title: 'Yam peel — daily market surplus',  category: 'vegetable_waste', targetUse: 'compost',      qty: 70 },
  { title: 'Mixed citrus peels',               category: 'fruit_waste',     targetUse: 'both',         qty: 40 },
  { title: 'Banana bunch offcuts',             category: 'fruit_waste',     targetUse: 'animal_feed',  qty: 90 },
];

const daysFromNow = (n) => new Date(Date.now() + n * 86400000);
const randomBetween = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

const makeUserDoc = (u, role) => ({
  name: u.name,
  email: u.email,
  password: 'Revora2024!',
  role,
  phone: u.phone,
  consentGiven: true,
  consentDate: new Date(),
  location: {
    type: 'Point',
    coordinates: u.coords,
    city: u.city,
    address: u.city,
  },
});

async function seed() {
  console.log('🌱 Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected\n');

  // Wipe existing pilot data
  await Promise.all([
    User.deleteMany({ email: /@pilot\.ng$/ }),
    Listing.deleteMany({ title: /Market|offcuts|surplus|rinds|trimmings|cores|peel|citrus|Banana/i }),
  ]);
  console.log('🗑  Cleared old pilot data\n');

  // Create users
  const vendors    = await User.create(VENDORS.map((u) => makeUserDoc(u, 'vendor')));
  const farmers    = await User.create(FARMERS.map((u) => makeUserDoc(u, 'farmer')));
  const composters = await User.create(COMPOSTERS.map((u) => makeUserDoc(u, 'composter')));

  console.log(`👥 Created ${vendors.length} vendors, ${farmers.length} farmers, ${composters.length} composters`);

  // Create listings
  const listingDocs = LISTING_TEMPLATES.map((t, i) => {
    const vendor = vendors[i % vendors.length];
    return {
      vendor: vendor._id,
      title: t.title,
      category: t.category,
      targetUse: t.targetUse,
      quantityKg: t.qty,
      description: `Fresh ${t.category.replace('_', ' ')} from ${vendor.location.city}. Available for pickup during market hours (6am–4pm).`,
      availableFrom: new Date(),
      availableUntil: daysFromNow(randomBetween(3, 10)),
      status: i < 5 ? 'active' : 'completed',
      location: {
        type: 'Point',
        coordinates: vendor.location.coordinates,
        address: vendor.location.city,
      },
      co2SavedKg: i >= 5 ? Math.round(t.qty * 0.55 * 10) / 10 : 0,
      byProductKg: i >= 5 ? Math.round(t.qty * 0.40 * 10) / 10 : 0,
    };
  });

  const listings = await Listing.create(listingDocs);
  console.log(`📋 Created ${listings.length} listings (5 active, 3 completed)`);

  // Create completed requests + ratings for the 3 completed listings
  const completedListings = listings.filter((l) => l.status === 'completed');
  const offTakers = [...farmers, ...composters];

  for (let i = 0; i < completedListings.length; i++) {
    const listing   = completedListings[i];
    const requester = offTakers[i % offTakers.length];

    const req = await Request.create({
      listing: listing._id,
      requester: requester._id,
      vendor: listing.vendor,
      status: 'completed',
      quantityRequestedKg: listing.quantityKg,
      message: 'Interested in this listing for my operation.',
      vendorRated: true,
      requesterRated: true,
    });

    const vScore = randomBetween(4, 5);
    const rScore = randomBetween(3, 5);

    await Rating.create([
      {
        request: req._id,
        rater: listing.vendor,
        ratee: requester._id,
        score: vScore,
        comment: 'Punctual pickup, would exchange again.',
        isRevealed: true,
      },
      {
        request: req._id,
        rater: requester._id,
        ratee: listing.vendor,
        score: rScore,
        comment: 'Quality waste, clearly labelled.',
        isRevealed: true,
      },
    ]);
  }

  console.log(`⭐ Created ${completedListings.length * 2} ratings`);

  // Update average ratings
  for (const user of [...vendors, ...farmers, ...composters]) {
    const ratings = await Rating.find({ ratee: user._id, isRevealed: true });
    if (ratings.length) {
      const avg = ratings.reduce((s, r) => s + r.score, 0) / ratings.length;
      await User.findByIdAndUpdate(user._id, {
        averageRating: Math.round(avg * 10) / 10,
        totalRatings: ratings.length,
      });
    }
  }

  console.log('\n✅ Pilot seed complete!\n');
  console.log('Pilot accounts (all use password: Revora2024!):');
  console.log('  Vendor:    chidinma@pilot.ng');
  console.log('  Farmer:    tunde@pilot.ng');
  console.log('  Composter: seun@pilot.ng');
  console.log('\n📊 Impact summary:');
  const totalKg = completedListings.reduce((s, l) => s + l.quantityKg, 0);
  console.log(`  Waste diverted : ${totalKg} kg`);
  console.log(`  CO₂ avoided    : ${Math.round(totalKg * 0.55 * 10) / 10} kg`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
