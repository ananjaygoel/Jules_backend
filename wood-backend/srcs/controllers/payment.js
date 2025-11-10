const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/user');

exports.createPaymentIntent = async (req, res) => {
  const { amount, currency } = req.body;
  const user = await User.findOne({ firebaseUid: req.user.uid });

  // Create a Stripe customer if one doesn't exist
  if (!user.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
    });
    user.stripeCustomerId = customer.id;
    await user.save();
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: user.stripeCustomerId,
    });
    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const user = await User.findOne({ stripeCustomerId: paymentIntent.customer });
    if (user) {
      // Assuming 1 cent = 1 coin
      const coinsPurchased = paymentIntent.amount / 100;
      user.coins += coinsPurchased;
      await user.save();
    }
  }

  res.status(200).json({ received: true });
};
