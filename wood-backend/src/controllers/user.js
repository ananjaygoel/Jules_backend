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
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'date_of_birth', 'country', 'preferred_genres'];
    const updates = _.pick(req.body, allowedUpdates);

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
