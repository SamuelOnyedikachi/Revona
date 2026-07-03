const request = require('supertest');
const express = require('express');
require('express-async-errors');
const {
  connectTestDB, clearTestDB, disconnectTestDB,
  makeUser, authHeader,
} = require('./helpers');
const Listing = require('../models/Listing');

process.env.JWT_SECRET = 'test_secret_key';
process.env.NODE_ENV = 'test';

const app = express();
app.use(express.json());
app.use('/api/impact', require('../routes/impact'));
app.use(require('../middleware/errorHandler'));

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(disconnectTestDB);

// ── POST /api/impact/estimate ──────────────────────────────
describe('POST /api/impact/estimate', () => {
  it('calculates CO2 savings for compost use', async () => {
    const res = await request(app)
      .post('/api/impact/estimate')
      .send({ quantityKg: 100, targetUse: 'compost' });
    expect(res.status).toBe(200);
    const { co2SavedKg, byProductKg, methaneAvoidedKg } = res.body.data;
    // 100 kg * 0.55 = 55 kg CO2
    expect(co2SavedKg).toBe(55);
    // 100 kg * 0.40 = 40 kg compost
    expect(byProductKg).toBe(40);
    // 100 kg * 0.10 = 10 kg CH4
    expect(methaneAvoidedKg).toBe(10);
  });

  it('calculates CO2 savings for animal_feed use', async () => {
    const res = await request(app)
      .post('/api/impact/estimate')
      .send({ quantityKg: 200, targetUse: 'animal_feed' });
    expect(res.status).toBe(200);
    // 200 * 0.30 = 60 kg feed
    expect(res.body.data.byProductKg).toBe(60);
  });

  it('uses average ratio for "both" targetUse', async () => {
    const res = await request(app)
      .post('/api/impact/estimate')
      .send({ quantityKg: 100, targetUse: 'both' });
    expect(res.status).toBe(200);
    // (0.40 + 0.30) / 2 = 0.35; 100 * 0.35 = 35
    expect(res.body.data.byProductKg).toBe(35);
  });

  it('returns zeros for invalid quantity', async () => {
    const res = await request(app)
      .post('/api/impact/estimate')
      .send({ quantityKg: 0, targetUse: 'compost' });
    expect(res.status).toBe(200);
    expect(res.body.data.co2SavedKg).toBe(0);
  });
});

// ── GET /api/impact/platform ───────────────────────────────
describe('GET /api/impact/platform', () => {
  it('returns zeroes when no completed listings', async () => {
    const res = await request(app).get('/api/impact/platform');
    expect(res.status).toBe(200);
    expect(res.body.data.wasteKgDiverted).toBe(0);
    expect(res.body.data.co2SavedKg).toBe(0);
  });

  it('sums completed listings correctly', async () => {
    const vendor = await makeUser({ role: 'vendor' });
    // Create 2 completed listings: 60 kg compost + 40 kg feed
    await Listing.create({
      vendor: vendor._id,
      title: 'L1', category: 'fruit_waste', targetUse: 'compost',
      quantityKg: 60, status: 'completed',
      availableUntil: new Date(),
      location: { type: 'Point', coordinates: [3.38, 6.52] },
    });
    await Listing.create({
      vendor: vendor._id,
      title: 'L2', category: 'vegetable_waste', targetUse: 'animal_feed',
      quantityKg: 40, status: 'completed',
      availableUntil: new Date(),
      location: { type: 'Point', coordinates: [3.38, 6.52] },
    });

    const res = await request(app).get('/api/impact/platform');
    expect(res.status).toBe(200);
    expect(res.body.data.wasteKgDiverted).toBe(100);
    // 100 * 0.55 = 55
    expect(res.body.data.co2SavedKg).toBe(55);
    // 60 * 0.40 = 24 compost
    expect(res.body.data.compostProducedKg).toBe(24);
    // 40 * 0.30 = 12 feed
    expect(res.body.data.animalFeedProducedKg).toBe(12);
  });
});

// ── GET /api/impact/me ─────────────────────────────────────
describe('GET /api/impact/me', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/impact/me');
    expect(res.status).toBe(401);
  });

  it('returns personal stats for vendor', async () => {
    const vendor = await makeUser({ role: 'vendor' });
    await Listing.create({
      vendor: vendor._id,
      title: 'My completed listing',
      category: 'fruit_waste',
      targetUse: 'compost',
      quantityKg: 80,
      status: 'completed',
      availableUntil: new Date(),
      location: { type: 'Point', coordinates: [3.38, 6.52] },
    });

    const res = await request(app)
      .get('/api/impact/me')
      .set(authHeader(vendor._id));

    expect(res.status).toBe(200);
    expect(res.body.data.wasteKgDiverted).toBe(80);
    expect(res.body.data.co2SavedKg).toBe(44); // 80 * 0.55
    expect(res.body.data.listingsCompleted).toBe(1);
  });
});
