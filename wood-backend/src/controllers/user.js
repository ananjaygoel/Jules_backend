const User = require('../models/user');

exports.register = async (req, res) => {
  try {
    const { firebaseUid, name, email } = req.body;
    const newUser = new User({
      firebaseUid,
      name,
      email,
    });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'date_of_birth', 'country', 'preferred_genres', 'gender'];
    const updates = {};
    for (const key in req.body) {
        if (allowedUpdates.includes(key)) {
            updates[key] = req.body[key];
        }
    }
    // If there are no allowed updates, just return the existing user unchanged
    if (Object.keys(updates).length === 0) {
      const existing = await User.findOne({ firebaseUid: req.user.uid });
      return res.status(200).json(existing);
    }

    const user = await User.findOneAndUpdate({ firebaseUid: req.user.uid }, updates, {
      new: true,
    });
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getStartedSeries = async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.user.uid }).populate('startedSeries');
        res.status(200).json(user.startedSeries);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
