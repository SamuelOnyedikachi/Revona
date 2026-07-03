const request = require('supertest');
const express = require('express');
require('express-async-errors');
const mongoose = require('mongoose');
const {
  connectTestDB, clearTestDB, disconnectTestDB,
  makeUser, authHeader,
} = require('./helpers');
const Request = require('../models/Request');
const Listing = require('../models/Listing');
const Rating = require('../models/Rating');
const User = require('../models/User');

process.env.JWT_SECRET = 'test_secret_key';
process.env.NODE_ENV = 'test';

const app = express();
app.use(express.json());
app.use('/api/ratings', require('../routes/ratings'));
app.use(require('../middleware/errorHandler'));

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(disconnectTestDB);

// ── Helpers ────────────────────────────────────────────────
const makeCompletedRequest = async (vendorId, requesterId) => {
  const listing = await Listing.create({
    vendor: vendorId,
    title: 'Test listing',
    category: 'fruit_waste',
    targetUse: 'compost',
    quantityKg: 50,
    status: 'completed',
    availableUntil: new Date(Date.now() + 86400000),
    location: { type: 'Point', coordinates: [3.38, 6.52] },
  });
  return Request.create({
    listing: listing._id,
    requester: requesterId,
    vendor: vendorId,
    status: 'completed',
    quantityRequestedKg: 50,
  });
};

// ── POST /api/ratings ──────────────────────────────────────
describe('POST /api/ratings', () => {
  it('allows vendor to submit a rating', async () => {
    const vendor    = await makeUser({ role: 'vendor',    email: 'v@r.ng' });
    const requester = await makeUser({ role: 'farmer',    email: 'f@r.ng' });
    const req       = await makeCompletedRequest(vendor._id, requester._id);

    const res = await request(app)
      .post('/api/ratings')
      .set(authHeader(vendor._id))
      .send({ requestId: req._id, score: 4, comment: 'Great pickup' });

    expect(res.status).toBe(201);
    expect(res.body.data.rating.score).toBe(4);
  });

  it('allows requester to submit a rating', async () => {
    const vendor    = await makeUser({ role: 'vendor',   email: 'v2@r.ng' });
    const requester = await makeUser({ role: 'farmer',   email: 'f2@r.ng' });
    const req       = await makeCompletedRequest(vendor._id, requester._id);

    const res = await request(app)
      .post('/api/ratings')
      .set(authHeader(requester._id))
      .send({ requestId: req._id, score: 5 });

    expect(res.status).toBe(201);
  });

  it('prevents duplicate rating from same user', async () => {
    const vendor    = await makeUser({ role: 'vendor',  email: 'v3@r.ng' });
    const requester = await makeUser({ role: 'farmer',  email: 'f3@r.ng' });
    const req       = await makeCompletedRequest(vendor._id, requester._id);

    await request(app)
      .post('/api/ratings')
      .set(authHeader(vendor._id))
      .send({ requestId: req._id, score: 3 });

    const res = await request(app)
      .post('/api/ratings')
      .set(authHeader(vendor._id))
      .send({ requestId: req._id, score: 5 });

    expect(res.status).toBe(409);
  });

  it('rejects rating from unrelated user', async () => {
    const vendor    = await makeUser({ role: 'vendor',  email: 'v4@r.ng' });
    const requester = await makeUser({ role: 'farmer',  email: 'f4@r.ng' });
    const outsider  = await makeUser({ role: 'farmer',  email: 'out@r.ng' });
    const req       = await makeCompletedRequest(vendor._id, requester._id);

    const res = await request(app)
      .post('/api/ratings')
      .set(authHeader(outsider._id))
      .send({ requestId: req._id, score: 2 });

    expect(res.status).toBe(403);
  });

  it('rejects rating on a non-completed request', async () => {
    const vendor    = await makeUser({ role: 'vendor',  email: 'v5@r.ng' });
    const requester = await makeUser({ role: 'farmer',  email: 'f5@r.ng' });
    const listing   = await Listing.create({
      vendor: vendor._id, title: 'L', category: 'fruit_waste',
      targetUse: 'compost', quantityKg: 20, status: 'active',
      availableUntil: new Date(Date.now() + 86400000),
      location: { type: 'Point', coordinates: [3.38, 6.52] },
    });
    const req = await Request.create({
      listing: listing._id, requester: requester._id,
      vendor: vendor._id, status: 'accepted', quantityRequestedKg: 20,
    });

    const res = await request(app)
      .post('/api/ratings')
      .set(authHeader(vendor._id))
      .send({ requestId: req._id, score: 4 });

    expect(res.status).toBe(400);
  });
});

// ── Double-blind reveal ────────────────────────────────────
describe('Double-blind rating reveal', () => {
  it('ratings are hidden until both parties rate', async () => {
    const vendor    = await makeUser({ role: 'vendor',  email: 'db-v@r.ng' });
    const requester = await makeUser({ role: 'farmer',  email: 'db-f@r.ng' });
    const req       = await makeCompletedRequest(vendor._id, requester._id);

    // Only vendor rates
    await request(app)
      .post('/api/ratings')
      .set(authHeader(vendor._id))
      .send({ requestId: req._id, score: 4 });

    const hiddenRatings = await Rating.find({ request: req._id });
    expect(hiddenRatings.every((r) => r.isRevealed === false)).toBe(true);
  });

  it('reveals both ratings once both parties have rated', async () => {
    const vendor    = await makeUser({ role: 'vendor',  email: 'rev-v@r.ng' });
    const requester = await makeUser({ role: 'farmer',  email: 'rev-f@r.ng' });
    const req       = await makeCompletedRequest(vendor._id, requester._id);

    // Both rate
    await request(app)
      .post('/api/ratings')
      .set(authHeader(vendor._id))
      .send({ requestId: req._id, score: 5 });

    await request(app)
      .post('/api/ratings')
      .set(authHeader(requester._id))
      .send({ requestId: req._id, score: 4 });

    const revealedRatings = await Rating.find({ request: req._id });
    expect(revealedRatings.every((r) => r.isRevealed === true)).toBe(true);
  });

  it('updates average rating on both users after reveal', async () => {
    const vendor    = await makeUser({ role: 'vendor',  email: 'avg-v@r.ng' });
    const requester = await makeUser({ role: 'farmer',  email: 'avg-f@r.ng' });
    const req       = await makeCompletedRequest(vendor._id, requester._id);

    await request(app)
      .post('/api/ratings')
      .set(authHeader(vendor._id))
      .send({ requestId: req._id, score: 4 });

    await request(app)
      .post('/api/ratings')
      .set(authHeader(requester._id))
      .send({ requestId: req._id, score: 5 });

    const updatedVendor    = await User.findById(vendor._id);
    const updatedRequester = await User.findById(requester._id);

    // vendor was rated 5 by requester
    expect(updatedVendor.averageRating).toBe(5);
    expect(updatedVendor.totalRatings).toBe(1);
    // requester was rated 4 by vendor
    expect(updatedRequester.averageRating).toBe(4);
    expect(updatedRequester.totalRatings).toBe(1);
  });
});

// ── GET /api/ratings/user/:id ──────────────────────────────
describe('GET /api/ratings/user/:id', () => {
  it('returns only revealed ratings', async () => {
    const vendor    = await makeUser({ role: 'vendor',  email: 'gr-v@r.ng' });
    const requester = await makeUser({ role: 'farmer',  email: 'gr-f@r.ng' });
    const req       = await makeCompletedRequest(vendor._id, requester._id);

    // Only vendor rates — ratings remain hidden
    await request(app)
      .post('/api/ratings')
      .set(authHeader(vendor._id))
      .send({ requestId: req._id, score: 3 });

    const res = await request(app).get(`/api/ratings/user/${vendor._id}`);
    expect(res.status).toBe(200);
    // vendor was rated by requester but requester hasn't rated yet → nothing revealed
    expect(res.body.data.ratings).toHaveLength(0);
  });

  it('returns revealed ratings after both rate', async () => {
    const vendor    = await makeUser({ role: 'vendor',  email: 'gr2-v@r.ng' });
    const requester = await makeUser({ role: 'farmer',  email: 'gr2-f@r.ng' });
    const req       = await makeCompletedRequest(vendor._id, requester._id);

    await request(app)
      .post('/api/ratings')
      .set(authHeader(vendor._id))
      .send({ requestId: req._id, score: 5 });

    await request(app)
      .post('/api/ratings')
      .set(authHeader(requester._id))
      .send({ requestId: req._id, score: 4 });

    // vendor was rated 5 by requester
    const res = await request(app).get(`/api/ratings/user/${vendor._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.ratings).toHaveLength(1);
    expect(res.body.data.ratings[0].score).toBe(5);
  });
});
