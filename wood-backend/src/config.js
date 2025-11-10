module.exports = {
  episodeFreeLimit: 15,
  episodeCost: 30,
  oneTimeTaskMinCoins: 100,
  oneTimeTaskMaxCoins: 300,
  followSocialMediaCoins: 150,
  dailyAdLimit: 30,
  adRewards: {
    tier1: { limit: 5, coins: 10 },
    tier2: { limit: 10, coins: 20 },
    tier3: { limit: 20, coins: 25 },
    tier4: { limit: 30, coins: 30 },
  },
  spinWheel: {
    winProbability: 0.9001,
    winAmount: 10,
    jackpotProbability: 0.0001,
    jackpotAmount: 100,
  },
  subscriptionBonus: 50,
  referralLimit: 10,
};
