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
  },
  date_of_birth: {
    type: Date,
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
    type: Date,
  },
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  followedSocialMedia: {
    type: Boolean,
    default: false,
  },
  referralsThisMonth: {
    type: Number,
    default: 0,
  },
  lastReferralDate: {
    type: Date,
  },
  lastSpinDate: {
    type: Date,
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
