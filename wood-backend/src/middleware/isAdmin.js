const User = require('../models/user');

const isAdmin = async (req, res, next) => {
  // TODO: Implement actual admin role check
  const user = await User.findOne({ firebaseUid: req.user.uid });
  if (user && user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden' });
  }
};

module.exports = isAdmin;
