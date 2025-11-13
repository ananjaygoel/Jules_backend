module.exports = {
  episodeFreeLimit: 15,
  episodeCost: 30,
  oneTimeTaskMinCoins: 100,
  oneTimeTaskMaxCoins: 300,
  followSocialMediaCoins: 150,
  dailyAdLimit: 25,
  adRewards: {
    tier1: { limit: 5, coins: 10 },
    tier2: { limit: 10, coins: 20 },
    tier3: { limit: 20, coins: 25 },
    tier4: { limit: 25, coins: 30 },
  },
  spinWheel: {
    winProbability: 0.9001,
    winAmount: 10,
    jackpotProbability: 0.0001,
    jackpotAmount: 100,
  },
  subscriptionBonus: 50,
  referralLimit: 10,
  membershipPlans: {
    tier1: {
        price: 300,
        stripePriceId: 'price_1SSBrd1CWpG7UzlDX0OONq34',
    },
    tier2: {
        price: 900,
        stripePriceId: 'price_1SSVvB1CWpG7UzlDnViZuuOi',
    }
  }
  ,
  iap: {
    android: {
      coins: [
        { productId: 'coins_50', coins: 500 },
        { productId: 'coins_100', coins: 1000 },
        { productId: 'coins_200', coins: 2000 },
      ],
      subscriptions: [
        { productId: 'sub_tier1', planKey: 'tier1' },
        { productId: 'sub_tier2', planKey: 'tier2' },
      ],
    },
    ios: {
      coins: [
        { productId: 'ios_coins_50', coins: 500 },
        { productId: 'ios_coins_100', coins: 1000 },
        { productId: 'ios_coins_200', coins: 2000 },
      ],
      subscriptions: [
        { productId: 'ios_sub_tier1', planKey: 'tier1' },
        { productId: 'ios_sub_tier2', planKey: 'tier2' },
      ],
    }
  }
};
