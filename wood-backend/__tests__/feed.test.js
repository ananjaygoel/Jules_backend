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
  let freeEpisode;
  let paidEpisode16;
  let paidEpisode17;

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
      coins: 100,
    });
    await user.save();

    series = new Series({
      title: 'Test Series',
      description: 'A test series',
      genre: 'Drama',
      coverImageUrl: 'http://example.com/cover.jpg',
    });
    await series.save();

    freeEpisode = new Episode({
      series: series._id,
      episodeNumber: 15, // Free episode
      videoUrl: 'http://example.com/episode15.mp4',
    });
    await freeEpisode.save();

    paidEpisode16 = new Episode({
      series: series._id,
      episodeNumber: 16, // First paid episode
      videoUrl: 'http://example.com/episode16.mp4',
    });
    await paidEpisode16.save();

    paidEpisode17 = new Episode({
        series: series._id,
        episodeNumber: 17, // Second paid episode
        videoUrl: 'http://example.com/episode17.mp4',
    });
    await paidEpisode17.save();
  });

  it('should allow a user to access a free episode', async () => {
    const res = await request(app)
      .get(`/api/feed/episode/${freeEpisode._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body._id).toBe(freeEpisode._id.toString());
  });

  it('should not allow a user to unlock an episode with insufficient coins', async () => {
    user.coins = 10;
    await user.save();
    const res = await request(app)
      .get(`/api/feed/episode/${paidEpisode16._id}`);
    expect(res.statusCode).toEqual(402);
    expect(res.body.error).toBe('Insufficient coins');
  });

  it('should not allow a user to unlock a paid episode if the previous one is not unlocked', async () => {
    const res = await request(app)
        .get(`/api/feed/episode/${paidEpisode17._id}`);
    expect(res.statusCode).toEqual(403);
    expect(res.body.error).toBe('You must unlock the previous episode first.');
  });

  it('should allow a user to unlock a paid episode with sufficient coins', async () => {
    const res = await request(app)
      .get(`/api/feed/episode/${paidEpisode16._id}`);
    expect(res.statusCode).toEqual(200);
    const updatedUser = await User.findById(user._id);
    expect(updatedUser.coins).toBe(70);
    expect(updatedUser.unlockedEpisodes).toContainEqual(paidEpisode16._id);
  });

  it('should allow a user to access an already unlocked episode', async () => {
    user.unlockedEpisodes.push(paidEpisode16._id);
    await user.save();
    const res = await request(app)
      .get(`/api/feed/episode/${paidEpisode16._id}`);
    expect(res.statusCode).toEqual(200);
    const updatedUser = await User.findById(user._id);
    expect(updatedUser.coins).toBe(100);
  });

  it('should return a 400 error for an invalid episode ID', async () => {
    const res = await request(app)
      .get('/api/feed/episode/invalid_id');
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe('Invalid ID');
  });
});
