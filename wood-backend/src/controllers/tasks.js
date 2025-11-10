const User = require('../models/user');
const config = require('../config');

const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// One-time tasks
exports.completeProfile = async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid });
  if (user.profileCompleted) {
    return res.status(400).json({ error: 'Profile already completed' });
  }
  const coins = Math.floor(Math.random() * (config.oneTimeTaskMaxCoins - config.oneTimeTaskMinCoins + 1)) + config.oneTimeTaskMinCoins;
  user.coins += coins;
  user.profileCompleted = true;
  await user.save();
  res.status(200).json({ coins_earned: coins });
};

exports.successfulReferral = async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid });
  const now = new Date();
  if (user.lastReferralDate && user.lastReferralDate.getMonth() === now.getMonth()) {
    if (user.referralsThisMonth >= config.referralLimit) {
      return res.status(400).json({ error: 'Referral limit reached for this month' });
    }
    user.referralsThisMonth += 1;
  } else {
    user.referralsThisMonth = 1;
  }
  user.lastReferralDate = now;

  const coins = Math.floor(Math.random() * (config.oneTimeTaskMaxCoins - config.oneTimeTaskMinCoins + 1)) + config.oneTimeTaskMinCoins;
  user.coins += coins;
  await user.save();
  res.status(200).json({ coins_earned: coins });
};

exports.followSocialMedia = async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid });
  if (user.followedSocialMedia) {
    return res.status(400).json({ error: 'Already followed on social media' });
  }
  user.coins += config.followSocialMediaCoins;
  user.followedSocialMedia = true;
  await user.save();
  res.status(200).json({ coins_earned: config.followSocialMediaCoins });
};

// Daily tasks
exports.watchAd = async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid });
  const now = new Date();

  if (user.lastAdWatched && isSameDay(user.lastAdWatched, now)) {
    if (user.dailyAdCount >= config.dailyAdLimit) {
      return res.status(400).json({ error: 'Daily ad limit reached' });
    }
    user.dailyAdCount += 1;
  } else {
    user.dailyAdCount = 1;
  }
  user.lastAdWatched = now;

  let coins = 0;
  if (user.dailyAdCount <= config.adRewards.tier1.limit) {
    coins = config.adRewards.tier1.coins;
  } else if (user.dailyAdCount <= config.adRewards.tier2.limit) {
    coins = config.adRewards.tier2.coins;
  } else if (user.dailyAdCount <= config.adRewards.tier3.limit) {
    coins = config.adRewards.tier3.coins;
  } else {
    coins = config.adRewards.tier4.coins;
  }

  if (user.subscriptionStatus === 'active') {
    coins += config.subscriptionBonus;
  }

  user.coins += coins;
  await user.save();
  res.status(200).json({ coins_earned: coins });
};

// Ambitious tasks
exports.spinWheel = async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid });
  const now = new Date();
  if (user.lastSpinDate && isSameDay(user.lastSpinDate, now)) {
    return res.status(400).json({ error: 'You can only spin the wheel once per day' });
  }

  const spin = Math.random();
  let coins = 0;
  if (spin < config.spinWheel.jackpotProbability) {
    coins = config.spinWheel.jackpotAmount;
  } else if (spin < config.spinWheel.winProbability) {
    coins = config.spinWheel.winAmount;
  }

  if (user.subscriptionStatus === 'active') {
    coins += config.subscriptionBonus;
  }

  user.coins += coins;
  user.lastSpinDate = now;
  await user.save();
  res.status(200).json({ coins_earned: coins });
};
