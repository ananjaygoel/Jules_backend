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
    if (!episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Add series to startedSeries if it's the first episode
    if (episode.episodeNumber === 1 && !user.startedSeries.includes(episode.series)) {
        user.startedSeries.push(episode.series);
    }

    // Free episodes are always accessible
    if (episode.episodeNumber <= config.episodeFreeLimit) {
        await user.save();
        return res.status(200).json(episode);
    }

    // Check if the user has already unlocked this episode
    if (user.unlockedEpisodes.includes(episode._id)) {
        await user.save();
        return res.status(200).json(episode);
    }

    // For paid episodes, check if the previous one is unlocked
    if (episode.episodeNumber > config.episodeFreeLimit + 1) {
        const previousEpisode = await Episode.findOne({
            series: episode.series,
            episodeNumber: episode.episodeNumber - 1
        });

        if (!previousEpisode || !user.unlockedEpisodes.includes(previousEpisode._id)) {
            return res.status(403).json({ error: 'You must unlock the previous episode first.' });
        }
    }

    // Check for sufficient coins
    if (user.coins < config.episodeCost) {
        return res.status(402).json({ error: 'Insufficient coins' });
    }

    // Unlock the episode for the user
    user.coins -= config.episodeCost;
    user.unlockedEpisodes.push(episode._id);
    await user.save();

    return res.status(200).json(episode);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
