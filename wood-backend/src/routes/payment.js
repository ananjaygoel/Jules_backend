const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment');
const authMiddleware = require('../middleware/auth');

const { createSubscriptionSchema, validationMiddleware } = require('../middleware/validation');

router.post('/create-payment-intent', authMiddleware, paymentController.createPaymentIntent);
router.post('/create-subscription', authMiddleware, validationMiddleware(createSubscriptionSchema), paymentController.createSubscription);
router.post('/stripe-webhook', paymentController.stripeWebhook);

module.exports = router;
