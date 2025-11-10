const request = require('supertest');
const app = require('../src/index');
const mongoose = require('mongoose');
const Series = require('../src/models/series');
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
});
