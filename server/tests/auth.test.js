const request = require('supertest');
const express = require('express');
require('express-async-errors');
const {
  connectTestDB, clearTestDB, disconnectTestDB,
  makeUser, authHeader,
} = require('./helpers');

// Bootstrap a minimal Express app for testing (no Socket.IO, no Cloudinary)
process.env.JWT_SECRET = 'test_secret_key';
process.env.NODE_ENV = 'test';

const app = express();
app.use(express.json());
app.use('/api/auth', require('../routes/auth'));
app.use(require('../middleware/errorHandler'));

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(disconnectTestDB);

// ── POST /api/auth/register ────────────────────────────────
describe('POST /api/auth/register', () => {
  const valid = {
    name: 'Amaka Osei',
    email: 'amaka@revora.ng',
    password: 'password123',
    role: 'vendor',
    consentGiven: 'true',
  };

  it('creates a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(valid);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.data.user.email).toBe(valid.email);
    expect(res.body.data.user.password).toBeUndefined(); // never returned
  });

  it('rejects duplicate email', async () => {
    await request(app).post('/api/auth/register').send(valid);
    const res = await request(app).post('/api/auth/register').send(valid);
    expect(res.status).toBe(409);
  });

  it('rejects missing consent', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...valid, consentGiven: 'false' });
    expect(res.status).toBe(400);
  });

  it('rejects invalid role', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...valid, role: 'hacker' });
    expect(res.status).toBe(400);
  });

  it('rejects password shorter than 8 chars', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...valid, password: '123' });
    expect(res.status).toBe(400);
  });
});

// ── POST /api/auth/login ───────────────────────────────────
describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await makeUser({ email: 'login@revora.ng', password: 'password123' });
  });

  it('returns token on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@revora.ng', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@revora.ng', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('rejects non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@revora.ng', password: 'password123' });
    expect(res.status).toBe(401);
  });
});

// ── GET /api/auth/me ───────────────────────────────────────
describe('GET /api/auth/me', () => {
  it('returns current user with valid token', async () => {
    const user = await makeUser({ email: 'me@revora.ng' });
    const res = await request(app)
      .get('/api/auth/me')
      .set(authHeader(user._id));
    expect(res.status).toBe(200);
    expect(res.body.data.user._id).toBe(user._id.toString());
  });

  it('rejects unauthenticated request', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not.a.real.token');
    expect(res.status).toBe(401);
  });
});
