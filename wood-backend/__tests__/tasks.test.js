const request = require('supertest');
const app = require('../src/index');
const mongoose = require('mongoose');
const User = require('../src/models/user');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock the auth middleware
jest.mock('../src/middleware/auth', () => (req, res, next) => {
  req.user = { uid: 'test_uid' };
  next();
});

describe('Tasks API', () => {
  let mongoServer;
  let user;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true });
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany();
    user = new User({
      firebaseUid: 'test_uid',
      name: 'Test User',
      email: 'test@example.com',
    });
    await user.save();
  });

  it('should complete the user profile and award coins', async () => {
    const res = await request(app)
      .post('/api/tasks/onetime/complete-profile');
    expect(res.statusCode).toEqual(200);
    expect(res.body.coins_earned).toBeGreaterThanOrEqual(100);
    expect(res.body.coins_earned).toBeLessThanOrEqual(300);
  });

  it('should not give a subscription bonus to a user with an expired subscription', async () => {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() - 1);
    user.subscriptionStatus = 'active';
    user.subscriptionExpiry = expiryDate;
    await user.save();

    const res = await request(app)
      .post('/api/tasks/daily/watch-ad');
    expect(res.statusCode).toEqual(200);
    expect(res.body.coins_earned).toBe(10);
  });
});
