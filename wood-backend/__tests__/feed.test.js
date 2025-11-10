const request = require('supertest');
const app = require('../src/index');
const mongoose = require('mongoose');
const User = require('../src/models/user');
const Series = require('../src/models/series');
const Episode = require('../src/models/episode');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock the auth middleware
jest.mock('../src/middleware/auth', () => (req, res, next) => {
  req.user = { uid: 'test_uid' };
  next();
});

describe('Feed API', () => {
  let mongoServer;
  let user;
  let series;
  let episode;

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
    await Series.deleteMany();
    await Episode.deleteMany();

    user = new User({
      firebaseUid: 'test_uid',
      name: 'Test User',
      email: 'test@example.com',
      coins: 10, // Not enough coins
    });
    await user.save();

    series = new Series({
      title: 'Test Series',
      description: 'A test series',
      genre: 'Drama',
      coverImageUrl: 'http://example.com/cover.jpg',
    });
    await series.save();

    episode = new Episode({
      series: series._id,
      episodeNumber: 20, // Paid episode
      videoUrl: 'http://example.com/episode20.mp4',
    });
    await episode.save();
  });

  it('should not allow a user to unlock an episode with insufficient coins', async () => {
    const res = await request(app)
      .get(`/api/feed/episode/${episode._id}`);
    expect(res.statusCode).toEqual(402);
    expect(res.body.error).toBe('Insufficient coins');
  });
});
