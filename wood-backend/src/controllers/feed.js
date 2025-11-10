const Series = require('../models/series');
const Episode = require('../models/episode');
const User = require('../models/user');

exports.getHomeFeed = async (req, res) => {
  try {
    const series = await Series.find();
    res.status(200).json(series);
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
    if (episode.episodeNumber <= 15) {
      return res.status(200).json(episode);
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (user.coins >= 30) {
      user.coins -= 30;
      await user.save();
      return res.status(200).json(episode);
    }

    res.status(402).json({ error: 'Insufficient coins' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
