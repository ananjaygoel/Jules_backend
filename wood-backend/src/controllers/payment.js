const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/user');
const Coupon = require('../models/coupon');
const config = require('../config');

exports.createPaymentIntent = async (req, res) => {
  const { amount, currency } = req.body;
  const user = await User.findOne({ firebaseUid: req.user.uid });

  if (!user.stripeCustomerId) {
    const customer = await stripe.customers.create({ email: user.email });
    user.stripeCustomerId = customer.id;
    await user.save();
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: user.stripeCustomerId,
    });
    res.status(200).send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSubscription = async (req, res) => {
  const { plan, couponCode } = req.body;
  const user = await User.findOne({ firebaseUid: req.user.uid });

  if (!user.stripeCustomerId) {
    const customer = await stripe.customers.create({ email: user.email });
    user.stripeCustomerId = customer.id;
    await user.save();
  }

  try {
    const sessionOptions = {
      payment_method_types: ['card'],
      line_items: [{ price: config.membershipPlans[plan].stripePriceId, quantity: 1 }],
      mode: 'subscription',
      customer: user.stripeCustomerId,
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    };

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode });
      if (coupon && coupon.expiryDate > new Date()) {
        const stripeCoupon = await stripe.coupons.create({
          percent_off: coupon.discountPercentage,
          duration: 'once',
        });
        sessionOptions.discounts = [{ coupon: stripeCoupon.id }];
      } else {
        return res.status(400).json({ error: 'Invalid or expired coupon code.' });
      }
    }

    const session = await stripe.checkout.sessions.create(sessionOptions);
    res.status(200).json({ sessionId: session.id });
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
      const amountInRupees = paymentIntent.amount_received / 100;
      const coinsPurchased = amountInRupees * 10;
      user.coins += coinsPurchased;
      await user.save();
    }
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const user = await User.findOne({ stripeCustomerId: session.customer });
    if (user && session.mode === 'subscription') {
      user.subscriptionStatus = 'active';
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      user.subscriptionExpiry = expiryDate;
      await user.save();
    }
  }

  res.status(200).json({ received: true });
};
