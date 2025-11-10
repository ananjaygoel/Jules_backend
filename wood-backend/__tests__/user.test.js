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

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({
        firebaseUid: 'new_test_uid',
        name: 'New Test User',
        email: 'new_test@example.com',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.name).toBe('New Test User');
  });

  it('should not allow a user to update their role', async () => {
    const res = await request(app)
      .put(`/api/user/${user._id}`)
      .send({ role: 'admin' });
    expect(res.statusCode).toEqual(200);
    const updatedUser = await User.findById(user._id);
    expect(updatedUser.role).toBe('user');
  });
});
