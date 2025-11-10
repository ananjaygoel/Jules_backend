const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  series: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Series',
    required: true,
  },
  episodeNumber: {
    type: Number,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Episode', episodeSchema);
