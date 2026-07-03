const Listing = require('../models/Listing');
const Request = require('../models/Request');

// Conversion factors (from literature — FAO / IPCC defaults)
const FACTORS = {
  CO2_PER_KG: 0.55,      // kg CO₂e avoided per kg diverted from landfill
  COMPOST_RATIO: 0.40,   // kg compost per kg input
  FEED_RATIO: 0.30,      // kg dry feed per kg input
  METHANE_FACTOR: 0.10,  // kg CH₄ per kg food landfilled
};

// GET /api/impact/platform  — aggregate platform stats
exports.getPlatformImpact = async (req, res) => {
  const completedListings = await Listing.find({ status: 'completed' });
  const totalKg = completedListings.reduce((s, l) => s + l.quantityKg, 0);
  const co2Saved = totalKg * FACTORS.CO2_PER_KG;
  const compostKg = completedListings
    .filter((l) => l.targetUse !== 'animal_feed')
    .reduce((s, l) => s + l.quantityKg * FACTORS.COMPOST_RATIO, 0);
  const feedKg = completedListings
    .filter((l) => l.targetUse !== 'compost')
    .reduce((s, l) => s + l.quantityKg * FACTORS.FEED_RATIO, 0);

  res.json({
    status: 'success',
    data: {
      wasteKgDiverted: Math.round(totalKg),
      co2SavedKg: Math.round(co2Saved * 10) / 10,
      compostProducedKg: Math.round(compostKg * 10) / 10,
      animalFeedProducedKg: Math.round(feedKg * 10) / 10,
      listingsCompleted: completedListings.length,
    },
  });
};

// GET /api/impact/me  — personal impact for logged-in user
exports.getMyImpact = async (req, res) => {
  const listings = await Listing.find({
    vendor: req.user.id,
    status: 'completed',
  });
  const totalKg = listings.reduce((s, l) => s + l.quantityKg, 0);

  res.json({
    status: 'success',
    data: {
      wasteKgDiverted: Math.round(totalKg),
      co2SavedKg: Math.round(totalKg * FACTORS.CO2_PER_KG * 10) / 10,
      listingsCompleted: listings.length,
      equivalentTreesPlanted: Math.round(totalKg * FACTORS.CO2_PER_KG / 21.77),
    },
  });
};

// POST /api/impact/estimate  — quick estimate before listing
exports.estimateImpact = async (req, res) => {
  const { quantityKg, targetUse } = req.body;
  const kg = parseFloat(quantityKg) || 0;

  const co2 = kg * FACTORS.CO2_PER_KG;
  const byProduct =
    targetUse === 'animal_feed' ? kg * FACTORS.FEED_RATIO
    : targetUse === 'compost'  ? kg * FACTORS.COMPOST_RATIO
    : kg * ((FACTORS.COMPOST_RATIO + FACTORS.FEED_RATIO) / 2);

  res.json({
    status: 'success',
    data: {
      co2SavedKg: Math.round(co2 * 10) / 10,
      byProductKg: Math.round(byProduct * 10) / 10,
      methaneAvoidedKg: Math.round(kg * FACTORS.METHANE_FACTOR * 10) / 10,
    },
  });
};
