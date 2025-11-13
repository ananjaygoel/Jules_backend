const Series = require('../models/series');
const Episode = require('../models/episode');
const Coupon = require('../models/coupon');
const User = require('../models/user');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

exports.createSeries = async (req, res) => {
  try {
    const series = new Series(req.body);
    await series.save();
    res.status(201).json(series);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateSeries = async (req, res) => {
  try {
    const series = await Series.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(series);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteSeries = async (req, res) => {
  try {
    await Series.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.createEpisode = async (req, res) => {
  try {
    const { series, episodeNumber } = req.body;
    let videoUrl;

    if (req.file) {
      // Upload to FastPix
      const formData = new FormData();
      formData.append('file', fs.createReadStream(req.file.path), {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
      formData.append('workspaceId', '1122907598036205569'); // Your workspace key

      const response = await axios.post('https://api.fastpix.io/v1/media', formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${process.env.FASTPIX_API_KEY}`, // Add to .env
        },
      });

      videoUrl = response.data.playback_url || response.data.url; // Adjust based on API response
      // Optionally delete temp file
      fs.unlinkSync(req.file.path);
    } else {
      videoUrl = req.body.videoUrl; // Fallback if no file
    }

    const episode = new Episode({ series, episodeNumber, videoUrl });
    await episode.save();
    res.status(201).json(episode);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateEpisode = async (req, res) => {
  try {
    const episode = await Episode.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(episode);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteEpisode = async (req, res) => {
  try {
    await Episode.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.assignAdminRole = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByIdAndUpdate(userId, { role: 'admin' }, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
