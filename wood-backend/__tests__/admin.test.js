const request = require('supertest');
const app = require('../src/index');
const mongoose = require('mongoose');
const Series = require('../src/models/series');
const User = require('../src/models/user');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock the auth and isAdmin middleware
jest.mock('../src/middleware/auth', () => (req, res, next) => {
  req.user = { uid: 'test_admin_uid' };
  next();
});
jest.mock('../src/middleware/isAdmin', () => (req, res, next) => {
  next();
});

describe('Admin API', () => {
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
    await Series.deleteMany();
    await User.deleteMany();
    user = new User({
      firebaseUid: 'test_uid',
      name: 'Test User',
      email: 'test@example.com',
    });
    await user.save();
  });

  it('should create a new series', async () => {
    const res = await request(app)
      .post('/api/admin/series')
      .send({
        title: 'Test Series',
        description: 'A test series',
        genre: 'Drama',
        coverImageUrl: 'http://example.com/cover.jpg',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.title).toBe('Test Series');
  });

  it('should assign the admin role to a user', async () => {
    const res = await request(app)
      .post('/api/admin/assign-admin-role')
      .send({ userId: user._id });
    expect(res.statusCode).toEqual(200);
    const updatedUser = await User.findOne({ email: 'test@example.com' });
    expect(updatedUser.role).toBe('admin');
  });
});
