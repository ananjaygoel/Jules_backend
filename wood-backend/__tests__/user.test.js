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

describe('User API', () => {
  let mongoServer;

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
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({
        firebaseUid: 'test_uid',
        name: 'Test User',
        email: 'test@example.com',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.name).toBe('Test User');
  });
});
