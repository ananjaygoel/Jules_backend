const User = require('../models/user');

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
  const coins = Math.floor(Math.random() * 201) + 100; // 100-300 coins
  user.coins += coins;
  user.profileCompleted = true;
  await user.save();
  res.status(200).json({ coins_earned: coins });
};

exports.successfulReferral = async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid });
  const now = new Date();
  if (user.lastReferralDate && user.lastReferralDate.getMonth() === now.getMonth()) {
    if (user.referralsThisMonth >= 10) {
      return res.status(400).json({ error: 'Referral limit reached for this month' });
    }
    user.referralsThisMonth += 1;
  } else {
    user.referralsThisMonth = 1;
  }
  user.lastReferralDate = now;

  const coins = Math.floor(Math.random() * 201) + 100; // 100-300 coins
  user.coins += coins;
  await user.save();
  res.status(200).json({ coins_earned: coins });
};

exports.followSocialMedia = async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid });
  if (user.followedSocialMedia) {
    return res.status(400).json({ error: 'Already followed on social media' });
  }
  const coins = 150; // Fixed amount
  user.coins += coins;
  user.followedSocialMedia = true;
  await user.save();
  res.status(200).json({ coins_earned: coins });
};

// Daily tasks
exports.watchAd = async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid });
  const now = new Date();

  if (user.lastAdWatched && isSameDay(user.lastAdWatched, now)) {
    if (user.dailyAdCount >= 30) {
      return res.status(400).json({ error: 'Daily ad limit reached' });
    }
    user.dailyAdCount += 1;
  } else {
    user.dailyAdCount = 1;
  }
  user.lastAdWatched = now;

  let coins = 0;
  if (user.dailyAdCount <= 5) {
    coins = 10;
  } else if (user.dailyAdCount <= 10) {
    coins = 20;
  } else if (user.dailyAdCount <= 20) {
    coins = 25;
  } else {
    coins = 30;
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
  if (spin < 0.0001) {
    coins = 100;
  } else if (spin < 0.9001) {
    coins = 10;
  }
  user.coins += coins;
  user.lastSpinDate = now;
  await user.save();
  res.status(200).json({ coins_earned: coins });
};
