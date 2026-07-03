const request = require('supertest');
const express = require('express');
require('express-async-errors');
const mongoose = require('mongoose');
const {
  connectTestDB, clearTestDB, disconnectTestDB,
  makeUser, authHeader,
} = require('./helpers');
const Listing = require('../models/Listing');
const Request = require('../models/Request');

process.env.JWT_SECRET = 'test_secret_key';
process.env.NODE_ENV = 'test';

const app = express();
app.use(express.json());
app.use('/api/requests', require('../routes/requests'));
app.use(require('../middleware/errorHandler'));

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(disconnectTestDB);

const makeListing = async (vendorId, status = 'active') =>
  Listing.create({
    vendor: vendorId,
    title: 'Mango waste',
    category: 'fruit_waste',
    targetUse: 'both',
    quantityKg: 80,
    status,
    availableUntil: new Date(Date.now() + 86400000),
    location: { type: 'Point', coordinates: [3.38, 6.52] },
  });

// ── POST /api/requests ─────────────────────────────────────
describe('POST /api/requests', () => {
  it('farmer can send a pickup request', async () => {
    const vendor = await makeUser({ role: 'vendor',  email: 'v@req.ng' });
    const farmer = await makeUser({ role: 'farmer',  email: 'f@req.ng' });
    const listing = await makeListing(vendor._id);

    const res = await request(app)
      .post('/api/requests')
      .set(authHeader(farmer._id))
      .send({ listingId: listing._id, quantityRequestedKg: 40, message: 'Need for my hens' });

    expect(res.status).toBe(201);
    expect(res.body.data.request.status).toBe('pending');

    // Listing should now be reserved
    const updated = await Listing.findById(listing._id);
    expect(updated.status).toBe('reserved');
  });

  it('composter can send a pickup request', async () => {
    const vendor    = await makeUser({ role: 'vendor',     email: 'v2@req.ng' });
    const composter = await makeUser({ role: 'composter',  email: 'c@req.ng' });
    const listing   = await makeListing(vendor._id);

    const res = await request(app)
      .post('/api/requests')
      .set(authHeader(composter._id))
      .send({ listingId: listing._id, quantityRequestedKg: 80 });

    expect(res.status).toBe(201);
  });

  it('vendor cannot request their own listing', async () => {
    const vendor  = await makeUser({ role: 'vendor', email: 'self@req.ng' });
    const listing = await makeListing(vendor._id);

    const res = await request(app)
      .post('/api/requests')
      .set(authHeader(vendor._id))
      .send({ listingId: listing._id, quantityRequestedKg: 10 });

    expect(res.status).toBe(400);
  });

  it('cannot request a non-active listing', async () => {
    const vendor  = await makeUser({ role: 'vendor',  email: 'v3@req.ng' });
    const farmer  = await makeUser({ role: 'farmer',  email: 'f3@req.ng' });
    const listing = await makeListing(vendor._id, 'reserved');

    const res = await request(app)
      .post('/api/requests')
      .set(authHeader(farmer._id))
      .send({ listingId: listing._id, quantityRequestedKg: 10 });

    expect(res.status).toBe(400);
  });

  it('rejects unauthenticated request', async () => {
    const vendor  = await makeUser({ role: 'vendor', email: 'v4@req.ng' });
    const listing = await makeListing(vendor._id);

    const res = await request(app)
      .post('/api/requests')
      .send({ listingId: listing._id, quantityRequestedKg: 10 });

    expect(res.status).toBe(401);
  });
});

// ── GET /api/requests ──────────────────────────────────────
describe('GET /api/requests', () => {
  it('vendor sees only their incoming requests', async () => {
    const vendor  = await makeUser({ role: 'vendor',  email: 'gv@req.ng' });
    const farmer  = await makeUser({ role: 'farmer',  email: 'gf@req.ng' });
    const listing = await makeListing(vendor._id);

    await Request.create({
      listing: listing._id, requester: farmer._id,
      vendor: vendor._id, status: 'pending', quantityRequestedKg: 20,
    });

    const res = await request(app)
      .get('/api/requests')
      .set(authHeader(vendor._id));

    expect(res.status).toBe(200);
    expect(res.body.data.requests.length).toBeGreaterThanOrEqual(1);
    res.body.data.requests.forEach((r) => {
      expect(r.vendor._id || r.vendor).toBe(vendor._id.toString());
    });
  });
});

// ── PATCH /api/requests/:id/status ────────────────────────
describe('PATCH /api/requests/:id/status', () => {
  const setupRequest = async () => {
    const vendor  = await makeUser({ role: 'vendor',  email: `v-${Date.now()}@s.ng` });
    const farmer  = await makeUser({ role: 'farmer',  email: `f-${Date.now()}@s.ng` });
    const listing = await makeListing(vendor._id);
    const req     = await Request.create({
      listing: listing._id, requester: farmer._id,
      vendor: vendor._id, status: 'pending', quantityRequestedKg: 20,
    });
    return { vendor, farmer, listing, req };
  };

  it('vendor can accept a pending request', async () => {
    const { vendor, req } = await setupRequest();
    const res = await request(app)
      .patch(`/api/requests/${req._id}/status`)
      .set(authHeader(vendor._id))
      .send({ status: 'accepted' });
    expect(res.status).toBe(200);
    expect(res.body.data.request.status).toBe('accepted');
  });

  it('vendor can reject a pending request — listing returns to active', async () => {
    const { vendor, listing, req } = await setupRequest();
    const res = await request(app)
      .patch(`/api/requests/${req._id}/status`)
      .set(authHeader(vendor._id))
      .send({ status: 'rejected' });
    expect(res.status).toBe(200);
    const reactivated = await Listing.findById(listing._id);
    expect(reactivated.status).toBe('active');
  });

  it('vendor can mark request as completed — listing becomes completed', async () => {
    const { vendor, listing, req } = await setupRequest();
    await Request.findByIdAndUpdate(req._id, { status: 'accepted' });
    const res = await request(app)
      .patch(`/api/requests/${req._id}/status`)
      .set(authHeader(vendor._id))
      .send({ status: 'completed' });
    expect(res.status).toBe(200);
    const completed = await Listing.findById(listing._id);
    expect(completed.status).toBe('completed');
  });

  it('farmer cannot change status (role restriction)', async () => {
    const { farmer, req } = await setupRequest();
    const res = await request(app)
      .patch(`/api/requests/${req._id}/status`)
      .set(authHeader(farmer._id))
      .send({ status: 'accepted' });
    expect(res.status).toBe(403);
  });

  it('vendor cannot update another vendor\'s request', async () => {
    const { req } = await setupRequest();
    const other = await makeUser({ role: 'vendor', email: `other-${Date.now()}@s.ng` });
    const res = await request(app)
      .patch(`/api/requests/${req._id}/status`)
      .set(authHeader(other._id))
      .send({ status: 'accepted' });
    expect(res.status).toBe(403);
  });
});
