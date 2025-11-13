const mongoose = require('mongoose');

const seriesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
    index: true,
  },
  coverImageUrl: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Series', seriesSchema);
