const request = require('supertest');
const express = require('express');
require('express-async-errors');
const mongoose = require('mongoose');
const {
  connectTestDB, clearTestDB, disconnectTestDB,
  makeUser, authHeader,
} = require('./helpers');
const Listing = require('../models/Listing');

process.env.JWT_SECRET = 'test_secret_key';
process.env.NODE_ENV = 'test';

// Stub out Cloudinary so upload tests don't need real credentials
jest.mock('../config/cloudinary', () => ({
  cloudinary: { uploader: { destroy: jest.fn() } },
  upload: {
    array: () => (req, res, next) => {
      req.files = [];
      next();
    },
  },
}));

const app = express();
app.use(express.json());
app.use('/api/listings', require('../routes/listings'));
app.use(require('../middleware/errorHandler'));

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(disconnectTestDB);

// Helper: create a listing directly in DB
const makeListing = async (vendorId, overrides = {}) => {
  const defaults = {
    vendor: vendorId,
    title: 'Test tomato waste',
    category: 'vegetable_waste',
    targetUse: 'compost',
    quantityKg: 50,
    availableUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    location: {
      type: 'Point',
      coordinates: [3.3792, 6.5244],
      address: 'Mile 12 Market',
    },
  };
  return Listing.create({ ...defaults, ...overrides });
};

// ── GET /api/listings ──────────────────────────────────────
describe('GET /api/listings', () => {
  it('returns empty array when no listings exist', async () => {
    const res = await request(app).get('/api/listings');
    expect(res.status).toBe(200);
    expect(res.body.data.listings).toHaveLength(0);
  });

  it('returns active listings', async () => {
    const vendor = await makeUser({ role: 'vendor' });
    await makeListing(vendor._id);
    await makeListing(vendor._id, { title: 'Second listing' });
    const res = await request(app).get('/api/listings');
    expect(res.status).toBe(200);
    expect(res.body.data.listings.length).toBeGreaterThanOrEqual(2);
  });

  it('filters by category', async () => {
    const vendor = await makeUser({ role: 'vendor' });
    await makeListing(vendor._id, { category: 'fruit_waste' });
    await makeListing(vendor._id, { category: 'vegetable_waste' });
    const res = await request(app).get('/api/listings?category=fruit_waste');
    expect(res.status).toBe(200);
    res.body.data.listings.forEach((l) => {
      expect(l.category).toBe('fruit_waste');
    });
  });

  it('filters by targetUse', async () => {
    const vendor = await makeUser({ role: 'vendor' });
    await makeListing(vendor._id, { targetUse: 'animal_feed' });
    await makeListing(vendor._id, { targetUse: 'compost' });
    const res = await request(app).get('/api/listings?targetUse=animal_feed');
    expect(res.status).toBe(200);
    res.body.data.listings.forEach((l) => {
      expect(l.targetUse).toBe('animal_feed');
    });
  });
});

// ── GET /api/listings/:id ──────────────────────────────────
describe('GET /api/listings/:id', () => {
  it('returns a single listing and increments views', async () => {
    const vendor = await makeUser({ role: 'vendor' });
    const listing = await makeListing(vendor._id);
    const res = await request(app).get(`/api/listings/${listing._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.listing._id).toBe(listing._id.toString());
    expect(res.body.data.listing.views).toBe(1);
  });

  it('returns 404 for non-existent listing', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/listings/${fakeId}`);
    expect(res.status).toBe(404);
  });
});

// ── POST /api/listings ─────────────────────────────────────
describe('POST /api/listings', () => {
  const validBody = {
    title: 'Fresh pepper offcuts',
    category: 'vegetable_waste',
    targetUse: 'both',
    quantityKg: '30',
    availableUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    address: 'Ketu Market, Lagos',
    latitude: '6.5244',
    longitude: '3.3792',
  };

  it('allows vendor to create listing', async () => {
    const vendor = await makeUser({ role: 'vendor' });
    const res = await request(app)
      .post('/api/listings')
      .set(authHeader(vendor._id))
      .send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.data.listing.title).toBe(validBody.title);
    expect(res.body.data.listing.vendor).toBe(vendor._id.toString());
  });

  it('rejects unauthenticated request', async () => {
    const res = await request(app).post('/api/listings').send(validBody);
    expect(res.status).toBe(401);
  });

  it('rejects farmer from creating listing', async () => {
    const farmer = await makeUser({ role: 'farmer' });
    const res = await request(app)
      .post('/api/listings')
      .set(authHeader(farmer._id))
      .send(validBody);
    expect(res.status).toBe(403);
  });
});

// ── DELETE /api/listings/:id ───────────────────────────────
describe('DELETE /api/listings/:id', () => {
  it('allows vendor to delete their own listing', async () => {
    const vendor = await makeUser({ role: 'vendor' });
    const listing = await makeListing(vendor._id);
    const res = await request(app)
      .delete(`/api/listings/${listing._id}`)
      .set(authHeader(vendor._id));
    expect(res.status).toBe(200);
    const gone = await Listing.findById(listing._id);
    expect(gone).toBeNull();
  });

  it('prevents another vendor from deleting someone else\'s listing', async () => {
    const owner = await makeUser({ role: 'vendor', email: 'owner@test.ng' });
    const other = await makeUser({ role: 'vendor', email: 'other@test.ng' });
    const listing = await makeListing(owner._id);
    const res = await request(app)
      .delete(`/api/listings/${listing._id}`)
      .set(authHeader(other._id));
    expect(res.status).toBe(403);
  });
});
