const User = require('../models/user');
const config = require('../config');
const { isSubscriptionActive } = require('../helpers/subscription');

const getUTCDateString = () => new Date().toISOString().slice(0, 10);

// One-time tasks
exports.completeProfile = async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid });
  if (user.profileCompleted) {
    return res.status(400).json({ error: 'Profile already completed' });
  }
  const coins = Math.floor(Math.random() * (config.oneTimeTaskMaxCoins - config.oneTimeTaskMinCoins + 1)) + config.oneTimeTaskMinCoins;
  await User.updateOne({ firebaseUid: req.user.uid }, { $inc: { coins }, profileCompleted: true });
  res.status(200).json({ coins_earned: coins });
};

exports.followSocialMedia = async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid });
  if (user.followedSocialMedia) {
    return res.status(400).json({ error: 'Already followed on social media' });
  }
  await User.updateOne({ firebaseUid: req.user.uid }, { $inc: { coins: config.followSocialMediaCoins }, followedSocialMedia: true });
  res.status(200).json({ coins_earned: config.followSocialMediaCoins });
};

// Monthly tasks
exports.monthlyBonus = async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid });
  const now = new Date();
  if (user.lastMonthlyBonus && user.lastMonthlyBonus.getMonth() === now.getMonth()) {
    return res.status(400).json({ error: 'Monthly bonus already claimed for this month' });
  }

  const coins = Math.floor(Math.random() * (config.oneTimeTaskMaxCoins - config.oneTimeTaskMinCoins + 1)) + config.oneTimeTaskMinCoins;
  await User.updateOne({ firebaseUid: req.user.uid }, { $inc: { coins }, lastMonthlyBonus: now });
  res.status(200).json({ coins_earned: coins });
};

// Daily tasks
exports.watchAd = async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid });
  const todayUTC = getUTCDateString();

  let dailyAdCount = user.dailyAdCount || 0;
  if (user.lastAdWatched === todayUTC) {
    if (dailyAdCount >= config.dailyAdLimit) {
      return res.status(400).json({ error: 'Daily ad limit reached' });
    }
  } else {
    dailyAdCount = 0;
  }
  dailyAdCount++;

  let coins = 0;
  if (dailyAdCount <= config.adRewards.tier1.limit) {
    coins = config.adRewards.tier1.coins;
  } else if (dailyAdCount <= config.adRewards.tier2.limit) {
    coins = config.adRewards.tier2.coins;
  } else if (dailyAdCount <= config.adRewards.tier3.limit) {
    coins = config.adRewards.tier3.coins;
  } else {
    coins = config.adRewards.tier4.coins;
  }

  if (isSubscriptionActive(user)) {
    coins += config.subscriptionBonus;
  }

  await User.updateOne({ firebaseUid: req.user.uid }, { $inc: { coins }, dailyAdCount, lastAdWatched: todayUTC });
  res.status(200).json({ coins_earned: coins });
};

// Ambitious tasks
exports.spinWheel = async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid });
  const todayUTC = getUTCDateString();
  if (user.lastSpinDate === todayUTC) {
    return res.status(400).json({ error: 'You can only spin the wheel once per day' });
  }

  const spin = Math.random();
  let coins = 0;
  if (spin < config.spinWheel.jackpotProbability) {
    coins = config.spinWheel.jackpotAmount;
  } else if (spin < config.spinWheel.winProbability) {
    coins = config.spinWheel.winAmount;
  }

  if (isSubscriptionActive(user)) {
    coins += config.subscriptionBonus;
  }

  await User.updateOne({ firebaseUid: req.user.uid }, { $inc: { coins }, lastSpinDate: todayUTC });
  res.status(200).json({ coins_earned: coins });
};
