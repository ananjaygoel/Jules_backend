const isSubscriptionActive = (user) => {
  if (!user.subscriptionStatus || user.subscriptionStatus !== 'active') {
    return false;
  }
  if (!user.subscriptionExpiry || user.subscriptionExpiry < new Date()) {
    return false;
  }
  return true;
};

module.exports = {
  isSubscriptionActive,
};
