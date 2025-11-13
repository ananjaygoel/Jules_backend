const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment');
const authMiddleware = require('../middleware/auth');

const { createSubscriptionSchema, validationMiddleware } = require('../middleware/validation');

router.get('/config', paymentController.getConfig);
router.post('/create-payment-intent', authMiddleware, paymentController.createPaymentIntent);
router.post('/create-subscription', authMiddleware, validationMiddleware(createSubscriptionSchema), paymentController.createSubscription);
router.post('/iap/verify', authMiddleware, paymentController.verifyIAP);
router.post('/google-rtdn', express.json(), paymentController.googleRtdn); // Pub/Sub push endpoint (no auth)
// Webhook is mounted directly in index.js with express.raw; do not mount it here

module.exports = router;
