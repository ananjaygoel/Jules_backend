const User = require('../models/user');
const { nanoid } = require('nanoid');

exports.generateCode = async (req, res) => {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (user.referralCode) {
        return res.status(200).json({ code: user.referralCode });
    }

    const code = nanoid(8);
    await User.updateOne({ firebaseUid: req.user.uid }, { referralCode: code });
    res.status(200).json({ code });
};

exports.enterCode = async (req, res) => {
    const { code } = req.body;
    const referrer = await User.findOne({ referralCode: code });
    if (!referrer) {
        return res.status(400).json({ error: 'Invalid referral code' });
    }

    const referee = await User.findOne({ firebaseUid: req.user.uid });
    if (referee.referredBy) {
        return res.status(400).json({ error: 'You have already used a referral code' });
    }

    if (referrer._id.equals(referee._id)) {
        return res.status(400).json({ error: 'You cannot refer yourself' });
    }

    // Reward the referrer
    await User.updateOne({ _id: referrer._id }, { $inc: { coins: 300 } });
    // Reward the referee
    await User.updateOne({ _id: referee._id }, { $inc: { coins: 200 }, referredBy: referrer._id });

    res.status(200).json({ message: 'Referral successful' });
};
