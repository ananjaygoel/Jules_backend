const User = require('../models/user');
const _ = require('lodash');

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
    const updates = _.pick(req.body, allowedUpdates);

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
