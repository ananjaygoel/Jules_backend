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
  const todayUTC = getUTCDateString();
  const user = await User.findOne({ firebaseUid: req.user.uid });

  const dailyAdCount = user.lastAdWatched === todayUTC ? user.dailyAdCount : 0;
  if (dailyAdCount >= config.dailyAdLimit) {
    return res.status(400).json({ error: 'Daily ad limit reached' });
  }

  const newDailyAdCount = dailyAdCount + 1;
  let coins = 0;
  if (newDailyAdCount <= config.adRewards.tier1.limit) {
    coins = config.adRewards.tier1.coins;
  } else if (newDailyAdCount <= config.adRewards.tier2.limit) {
    coins = config.adRewards.tier2.coins;
  } else if (newDailyAdCount <= config.adRewards.tier3.limit) {
    coins = config.adRewards.tier3.coins;
  } else {
    coins = config.adRewards.tier4.coins;
  }

  if (isSubscriptionActive(user)) {
    coins += config.subscriptionBonus;
  }

  await User.updateOne(
    { firebaseUid: req.user.uid },
    { $inc: { coins }, dailyAdCount: newDailyAdCount, lastAdWatched: todayUTC }
  );
  res.status(200).json({ coins_earned: coins });
};

// Ambitious tasks
exports.spinWheel = async (req, res) => {
  const todayUTC = getUTCDateString();
  const user = await User.findOneAndUpdate(
    { firebaseUid: req.user.uid, lastSpinDate: { $ne: todayUTC } },
    { lastSpinDate: todayUTC },
    { new: true }
  );

  if (!user) {
    return res.status(400).json({ error: 'You can only spin the wheel once per day' });
  }

  const spin = Math.random();
  let result = 'no_win';
  let potentialCoins = 0;
  if (spin < config.spinWheel.jackpotProbability) {
    result = 'jackpot';
    potentialCoins = config.spinWheel.jackpotAmount;
  } else if (spin < config.spinWheel.winProbability) {
    result = 'win';
    potentialCoins = config.spinWheel.winAmount;
  }

  // Store pending reward in user (add field if needed, or use session/temp)
  // For simplicity, return result; assume Flutter handles ad and calls claim
  res.status(200).json({ result, potentialCoins });
};

exports.claimSpinReward = async (req, res) => {
  // Assume ad watched; award coins
  const { result } = req.body; // From spin response
  const user = await User.findOne({ firebaseUid: req.user.uid });

  let coins = 0;
  if (result === 'jackpot') {
    coins = config.spinWheel.jackpotAmount;
  } else if (result === 'win') {
    coins = config.spinWheel.winAmount;
  }

  if (isSubscriptionActive(user)) {
    coins += config.subscriptionBonus;
  }

  await User.updateOne({ firebaseUid: req.user.uid }, { $inc: { coins } });
  res.status(200).json({ coins_earned: coins });
};
