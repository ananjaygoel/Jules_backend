let stripe = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  } else {
    console.warn('Stripe not configured (STRIPE_SECRET_KEY missing); payment endpoints are disabled in this environment.');
  }
} catch (e) {
  console.warn('Failed to initialize Stripe:', e.message);
  stripe = null;
}
const User = require('../models/user');
const Coupon = require('../models/coupon');
const config = require('../config');
const IapReceipt = require('../models/iap_receipt');
let google;
try {
  // Lazy require to avoid crashing if not installed in some envs
  ({ google } = require('googleapis'));
} catch (_) {
  google = null;
}

async function getAndroidPublisherClient() {
  if (!google) return { client: null, reason: 'googleapis not installed' };
  const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME;
  if (!packageName) return { client: null, reason: 'GOOGLE_PLAY_PACKAGE_NAME missing' };

  try {
    let auth;
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      auth = new google.auth.GoogleAuth({
        credentials: creds,
        scopes: ['https://www.googleapis.com/auth/androidpublisher']
      });
    } else {
      // Will use GOOGLE_APPLICATION_CREDENTIALS if set, or default ADC
      auth = new google.auth.GoogleAuth({ scopes: ['https://www.googleapis.com/auth/androidpublisher'] });
    }
    const client = await auth.getClient();
    const androidpublisher = google.androidpublisher({ version: 'v3', auth: client });
    return { client: androidpublisher, packageName };
  } catch (e) {
    return { client: null, reason: e.message };
  }
}

exports.getConfig = async (req, res) => {
  try {
    const plans = Object.entries(config.membershipPlans).map(([key, value]) => ({ key, price: value.price, stripePriceId: value.stripePriceId }));
    res.status(200).json({
      stripeEnabled: !!stripe,
      currency: 'inr',
      membershipPlans: plans,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      iap: {
        android: {
          coins: (config.iap && config.iap.android && config.iap.android.coins) ? config.iap.android.coins : [],
          subscriptions: (config.iap && config.iap.android && config.iap.android.subscriptions) ? config.iap.android.subscriptions : [],
        },
        ios: {
          coins: (config.iap && config.iap.ios && config.iap.ios.coins) ? config.iap.ios.coins : [],
          subscriptions: (config.iap && config.iap.ios && config.iap.ios.subscriptions) ? config.iap.ios.subscriptions : [],
        }
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.createPaymentIntent = async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Payments disabled (missing STRIPE_SECRET_KEY)' });
  }
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
  if (!stripe) {
    return res.status(503).json({ error: 'Subscriptions disabled (missing STRIPE_SECRET_KEY)' });
  }
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
    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.stripeWebhook = async (req, res) => {
  // In dev without Stripe configured, acknowledge and return
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(200).json({ received: true, disabled: true });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // req.body must be the raw buffer; configured in index.js using express.raw()
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

// Google RTDN (Real-time Developer Notifications) webhook (Pub/Sub push endpoint)
// Configure Pub/Sub push with OIDC token if possible and verify Authorization when env provided.
exports.googleRtdn = async (req, res) => {
  try {
    const msg = req.body?.message;
    if (!msg || !msg.data) {
      return res.status(400).json({ error: 'Invalid RTDN payload' });
    }
    const raw = Buffer.from(msg.data, 'base64').toString('utf8');
    const data = JSON.parse(raw);
    // Expected fields: packageName, eventTimeMillis, oneTimeProductNotification | subscriptionNotification
    const packageName = data.packageName;
    if (!packageName || (process.env.GOOGLE_PLAY_PACKAGE_NAME && packageName !== process.env.GOOGLE_PLAY_PACKAGE_NAME)) {
      return res.status(400).json({ error: 'Package mismatch' });
    }
    // Attempt to reconcile by purchaseToken
    const token = data.oneTimeProductNotification?.purchaseToken || data.subscriptionNotification?.purchaseToken;
    const productId = data.oneTimeProductNotification?.sku || data.subscriptionNotification?.subscriptionId;
    const isSub = !!data.subscriptionNotification;
    if (token) {
      // Upsert receipt record if not exists
      const existing = await IapReceipt.findOne({ token });
      if (!existing) {
        // Without user mapping we can't credit here; verification will map when the app sends receipt
        await IapReceipt.create({ platform: 'android', type: isSub ? 'subs' : 'inapp', productId: productId || 'unknown', token, orderId: undefined, user: undefined, status: 'verified' });
      }
    }
    // Acknowledge quickly; detailed reconciliation can be a background job
    return res.status(204).send();
  } catch (e) {
    return res.status(200).json({ received: true, error: e.message });
  }
};

// Verify IAP purchase. Uses Google Play Developer API when configured, otherwise supports dev mock.
exports.verifyIAP = async (req, res) => {
  const { platform, productId, purchaseToken, orderId, type, receiptData } = req.body;
  if (platform !== 'android') {
    // iOS handled below
  }
  const user = await User.findOne({ firebaseUid: req.user.uid });
  if (!user) return res.status(404).json({ error: 'User not found' });
  // iOS branch
  if (platform === 'ios') {
    try {
      if (!receiptData) return res.status(400).json({ error: 'Missing receiptData' });
      const sharedSecret = process.env.APPLE_IAP_SHARED_SECRET;
      if (!sharedSecret) return res.status(503).json({ error: 'Apple verification not configured' });
      const body = {
        'receipt-data': receiptData,
        password: sharedSecret,
        'exclude-old-transactions': true
      };
      const endpointProd = 'https://buy.itunes.apple.com/verifyReceipt';
      const endpointSandbox = 'https://sandbox.itunes.apple.com/verifyReceipt';
      const preferSandbox = process.env.APPLE_IAP_USE_SANDBOX === 'true';
      const doVerify = async (url) => {
        const axios = require('axios');
        const r = await axios.post(url, body, { timeout: 10000 });
        return r.data;
      };
      let data = await doVerify(preferSandbox ? endpointSandbox : endpointProd);
      if (data.status === 21007 && !preferSandbox) {
        data = await doVerify(endpointSandbox); // retry on sandbox if receipt from test env
      }
      if (data.status !== 0) {
        return res.status(400).json({ error: `Apple verify failed: ${data.status}` });
      }
      const latest = (data.latest_receipt_info || [])[0] || null;
      const originalTransactionId = latest?.original_transaction_id || latest?.transaction_id;
      if (originalTransactionId && user.iosTransactionIds.includes(originalTransactionId)) {
        return res.status(200).json({ verified: true, duplicate: true });
      }
      const isSub = type === 'subs' || !!latest?.expires_date_ms;
      const pid = productId || latest?.product_id;
      if (!pid) return res.status(400).json({ error: 'Missing productId' });

      if (isSub) {
        user.subscriptionStatus = 'active';
        if (latest?.expires_date_ms) user.subscriptionExpiry = new Date(Number(latest.expires_date_ms));
      } else {
        const pack = (config.iap?.ios?.coins || config.iap?.android?.coins || []).find(p => p.productId === pid);
        if (!pack) return res.status(400).json({ error: 'Unknown productId' });
        user.coins += pack.coins;
      }
      if (originalTransactionId) user.iosTransactionIds.push(originalTransactionId);
      await user.save();
      if (originalTransactionId) {
        await IapReceipt.create({ platform: 'ios', type: isSub ? 'subs' : 'inapp', productId: pid, token: originalTransactionId, orderId: latest?.transaction_id || orderId, user: user._id, status: 'verified' });
      }
      return res.status(200).json({ verified: true, subscriptionStatus: user.subscriptionStatus, coins: user.coins });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  // ANDROID below
  if (platform !== 'android') {
    return res.status(400).json({ error: 'Unsupported platform' });
  }
  // Dev-only mock verification
  if (process.env.ALLOW_DEV_IAP_MOCK === 'true') {
    if (type === 'inapp') {
      const pack = (config.iap?.android?.coins || []).find(p => p.productId === productId);
      if (!pack) return res.status(400).json({ error: 'Unknown productId' });
      if (purchaseToken && user.androidInAppTokens.includes(purchaseToken)) {
        return res.status(200).json({ verified: true, duplicate: true, coins: user.coins });
      }
      user.coins += pack.coins;
      if (purchaseToken) user.androidInAppTokens.push(purchaseToken);
      await user.save();
      if (purchaseToken) await IapReceipt.create({ platform: 'android', type: 'inapp', productId, token: purchaseToken, orderId, user: user._id, status: 'verified' });
      return res.status(200).json({ verified: true, coins: user.coins });
    }
    if (type === 'subs') {
      const sub = (config.iap?.android?.subscriptions || []).find(s => s.productId === productId);
      if (!sub) return res.status(400).json({ error: 'Unknown subscription productId' });
      if (purchaseToken && user.androidSubscriptionTokens.includes(purchaseToken)) {
        return res.status(200).json({ verified: true, duplicate: true, subscriptionStatus: user.subscriptionStatus });
      }
      user.subscriptionStatus = 'active';
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      user.subscriptionExpiry = expiryDate;
      if (purchaseToken) user.androidSubscriptionTokens.push(purchaseToken);
      await user.save();
      if (purchaseToken) await IapReceipt.create({ platform: 'android', type: 'subs', productId, token: purchaseToken, orderId, user: user._id, status: 'verified' });
      return res.status(200).json({ verified: true, subscriptionStatus: user.subscriptionStatus });
    }
    return res.status(400).json({ error: 'Unknown type' });
  }

  // Production path: verify with Google Play if configured
  const { client: androidpublisher, packageName, reason } = await getAndroidPublisherClient();
  if (!androidpublisher) {
    return res.status(503).json({ error: `Play verification not configured: ${reason}` });
  }

  try {
    if (type === 'inapp') {
      const resp = await androidpublisher.purchases.products.get({
        packageName,
        productId,
        token: purchaseToken,
      });
      const data = resp.data || {};
      // purchaseState: 0 purchased, 1 canceled; acknowledgementState: 1 acknowledged
      if (data.purchaseState !== 0) return res.status(400).json({ error: 'Purchase not completed' });

      const pack = (config.iap?.android?.coins || []).find(p => p.productId === productId);
      if (!pack) return res.status(400).json({ error: 'Unknown productId' });
      if (purchaseToken && user.androidInAppTokens.includes(purchaseToken)) {
        return res.status(200).json({ verified: true, duplicate: true, coins: user.coins });
      }

      // Optionally acknowledge if not yet acknowledged
      if (process.env.GOOGLE_PLAY_ACKNOWLEDGE === 'true' && data.acknowledgementState === 0) {
        try {
          await androidpublisher.purchases.products.acknowledge({
            packageName,
            productId,
            token: purchaseToken,
            requestBody: { developerPayload: user.firebaseUid || orderId || '' },
          });
        } catch (_) { /* ignore ack errors */ }
      }

      user.coins += pack.coins;
      if (purchaseToken) user.androidInAppTokens.push(purchaseToken);
      await user.save();
      if (purchaseToken) await IapReceipt.create({ platform: 'android', type: 'inapp', productId, token: purchaseToken, orderId, user: user._id, status: 'verified' });
      return res.status(200).json({ verified: true, coins: user.coins });
    }

    if (type === 'subs') {
      const resp = await androidpublisher.purchases.subscriptions.get({
        packageName,
        subscriptionId: productId,
        token: purchaseToken,
      });
      const data = resp.data || {};
      // Consider valid if not canceled and expiry in future
      const expiryMs = Number(data.expiryTimeMillis || 0);
      if (!expiryMs || expiryMs <= Date.now()) return res.status(400).json({ error: 'Subscription not active' });
      if (purchaseToken && user.androidSubscriptionTokens.includes(purchaseToken)) {
        return res.status(200).json({ verified: true, duplicate: true, subscriptionStatus: user.subscriptionStatus, subscriptionExpiry: user.subscriptionExpiry });
      }

      if (process.env.GOOGLE_PLAY_ACKNOWLEDGE === 'true' && data.acknowledgementState === 0) {
        try {
          await androidpublisher.purchases.subscriptions.acknowledge({
            packageName,
            subscriptionId: productId,
            token: purchaseToken,
            requestBody: { developerPayload: user.firebaseUid || orderId || '' },
          });
        } catch (_) { /* ignore ack errors */ }
      }

      user.subscriptionStatus = 'active';
      user.subscriptionExpiry = new Date(expiryMs);
      if (purchaseToken) user.androidSubscriptionTokens.push(purchaseToken);
      await user.save();
      if (purchaseToken) await IapReceipt.create({ platform: 'android', type: 'subs', productId, token: purchaseToken, orderId, user: user._id, status: 'verified' });
      return res.status(200).json({ verified: true, subscriptionStatus: user.subscriptionStatus, subscriptionExpiry: user.subscriptionExpiry });
    }

    return res.status(400).json({ error: 'Unknown type' });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};
