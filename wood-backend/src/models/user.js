const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  date_of_birth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
  },
  country: {
    type: String,
  },
  preferred_genres: {
    type: [String],
  },
  coins: {
    type: Number,
    default: 0,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  dailyAdCount: {
    type: Number,
    default: 0,
  },
  lastAdWatched: {
    type: String, // YYYY-MM-DD in UTC
  },
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  followedSocialMedia: {
    type: Boolean,
    default: false,
  },
  lastMonthlyBonus: {
    type: Date,
  },
  lastSpinDate: {
    type: String, // YYYY-MM-DD in UTC
  },
  stripeCustomerId: {
    type: String,
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive',
  },
  subscriptionExpiry: {
    type: Date,
  },
});

module.exports = mongoose.model('User', userSchema);
