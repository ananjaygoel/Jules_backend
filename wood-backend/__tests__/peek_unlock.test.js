const request = require('supertest');
const app = require('../src/index');
const mongoose = require('mongoose');
const User = require('../src/models/user');
const Series = require('../src/models/series');
const Episode = require('../src/models/episode');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock auth middleware
jest.mock('../src/middleware/auth', () => (req, res, next) => {
  req.user = { uid: 'test_uid' };
  next();
});

describe('Peek/Unlock API', () => {
  let mongoServer;
  let user;
  let series;
  let epFree;
  let ep16;
  let ep17;

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

  user = new User({ firebaseUid: 'test_uid', name: 'Test User', email: 't@e.com', coins: 60 });
    await user.save();

  series = new Series({ title: 'S', description: 'D', genre: 'Drama', coverImageUrl: 'http://example.com/cover.jpg' });
    await series.save();

    epFree = new Episode({ series: series._id, episodeNumber: 10, videoUrl: 'free.mp4' });
    await epFree.save();

    ep16 = new Episode({ series: series._id, episodeNumber: 16, videoUrl: '16.mp4' });
    await ep16.save();

    ep17 = new Episode({ series: series._id, episodeNumber: 17, videoUrl: '17.mp4' });
    await ep17.save();
  });

  it('peek shows free for free episode', async () => {
    const res = await request(app).get(`/api/feed/episode/${epFree._id}/peek`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('free');
  });

  it('peek shows can_unlock for first paid episode with enough coins', async () => {
    const res = await request(app).get(`/api/feed/episode/${ep16._id}/peek`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('can_unlock');
    expect(res.body.cost).toBeDefined();
  });

  it('peek shows previous_locked for second paid episode if previous not unlocked', async () => {
    const res = await request(app).get(`/api/feed/episode/${ep17._id}/peek`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('previous_locked');
  });

  it('unlock succeeds and deducts coins', async () => {
    const res = await request(app).post(`/api/feed/episode/${ep16._id}/unlock`);
    expect(res.statusCode).toBe(200);
    const updated = await User.findById(user._id);
    expect(updated.unlockedEpisodes).toContainEqual(ep16._id);
    expect(updated.coins).toBeLessThan(60);
  });

  it('unlock fails with 402 when not enough coins', async () => {
    user.coins = 0; await user.save();
    const res = await request(app).post(`/api/feed/episode/${ep16._id}/unlock`);
    expect(res.statusCode).toBe(402);
  });

  it('unlock fails with 403 when previous locked', async () => {
    const res = await request(app).post(`/api/feed/episode/${ep17._id}/unlock`);
    expect(res.statusCode).toBe(403);
  });
});
