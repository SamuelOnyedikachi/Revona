const Listing = require('../models/Listing');
const { AppError } = require('../utils/AppError');
const { cloudinary } = require('../config/cloudinary');

// ── Impact conversion factors (literature-derived) ─────────
// 1 kg fruit/veg waste → 0.55 kg CO₂e avoided (vs landfill)
// 1 kg fruit/veg waste → 0.4 kg compost OR 0.3 kg animal feed (dry weight)
const CO2_PER_KG = 0.55;
const COMPOST_RATIO = 0.4;
const FEED_RATIO = 0.3;

// POST /api/listings
exports.createListing = async (req, res) => {
  const {
    title, description, category, targetUse,
    quantityKg, availableFrom, availableUntil,
    longitude, latitude, address,
  } = req.body;

  const photos = req.files ? req.files.map((f) => f.path) : [];

  const listing = await Listing.create({
    vendor: req.user.id,
    title, description, category, targetUse,
    quantityKg: Number(quantityKg),
    availableFrom, availableUntil,
    photos,
    location: {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
      address,
    },
  });

  res.status(201).json({ status: 'success', data: { listing } });
};

// GET /api/listings — with optional geo-search
// Query params: lat, lng, radiusKm, category, targetUse, page, limit
exports.getListings = async (req, res) => {
  const {
    lat, lng, radiusKm = 20,
    category, targetUse, status = 'active',
    page = 1, limit = 20,
  } = req.query;

  const filter = { status };
  if (category) filter.category = category;
  if (targetUse) filter.targetUse = targetUse;

  // Geospatial filter if coordinates provided
  if (lat && lng) {
    filter.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseFloat(radiusKm) * 1000, // metres
      },
    };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .populate('vendor', 'name averageRating badges location.city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Listing.countDocuments(filter),
  ]);

  res.json({
    status: 'success',
    results: listings.length,
    total,
    pages: Math.ceil(total / Number(limit)),
    data: { listings },
  });
};

// GET /api/listings/:id
exports.getListing = async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate('vendor', 'name averageRating badges location phone');

  if (!listing) throw new AppError('Listing not found', 404);
  res.json({ status: 'success', data: { listing } });
};

// PUT /api/listings/:id
exports.updateListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new AppError('Listing not found', 404);
  if (listing.vendor.toString() !== req.user.id) {
    throw new AppError('Not authorised to edit this listing', 403);
  }

  Object.assign(listing, req.body);
  await listing.save();
  res.json({ status: 'success', data: { listing } });
};

// DELETE /api/listings/:id
exports.deleteListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new AppError('Listing not found', 404);
  if (listing.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Not authorised', 403);
  }

  // Remove Cloudinary images
  for (const url of listing.photos) {
    const publicId = url.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '');
    await cloudinary.uploader.destroy(publicId);
  }

  await listing.deleteOne();
  res.json({ status: 'success', message: 'Listing removed' });
};

// GET /api/listings/vendor/:vendorId
exports.getVendorListings = async (req, res) => {
  const listings = await Listing.find({ vendor: req.params.vendorId })
    .sort({ createdAt: -1 });
  res.json({ status: 'success', data: { listings } });
};
