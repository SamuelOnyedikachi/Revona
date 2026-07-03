const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let mongod;

// Start in-memory MongoDB before all tests
const connectTestDB = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
};

// Drop all collections between tests
const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

// Disconnect and stop server after all tests
const disconnectTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

// ── Factories ──────────────────────────────────────────────

const makeUser = async (overrides = {}) => {
  const defaults = {
    name: 'Test User',
    email: `test-${Date.now()}@revora.ng`,
    password: 'password123',
    role: 'vendor',
    consentGiven: true,
    consentDate: new Date(),
  };
  return User.create({ ...defaults, ...overrides });
};

const makeToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test_secret_key', {
    expiresIn: '1d',
  });

const authHeader = (userId) => ({
  Authorization: `Bearer ${makeToken(userId)}`,
});

module.exports = {
  connectTestDB,
  clearTestDB,
  disconnectTestDB,
  makeUser,
  makeToken,
  authHeader,
};
