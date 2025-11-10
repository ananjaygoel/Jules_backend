const Series = require('../models/series');
const Episode = require('../models/episode');
const User = require('../models/user');
const config = require('../config');

exports.getHomeFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const series = await Series.find().skip(skip).limit(limit);
    const total = await Series.countDocuments();

    res.status(200).json({
      series,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getSeries = async (req, res) => {
  try {
    const series = await Series.findById(req.params.id);
    const episodes = await Episode.find({ series: req.params.id });
    res.status(200).json({ series, episodes });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getEpisode = async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.id);
    if (episode.episodeNumber <= config.episodeFreeLimit) {
      return res.status(200).json(episode);
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (user.coins >= config.episodeCost) {
      user.coins -= config.episodeCost;
      await user.save();
      return res.status(200).json(episode);
    }

    res.status(402).json({ error: 'Insufficient coins' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
