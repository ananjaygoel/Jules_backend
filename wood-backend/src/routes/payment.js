const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment');
const authMiddleware = require('../middleware/auth');

router.post('/create-payment-intent', authMiddleware, paymentController.createPaymentIntent);
router.post('/stripe-webhook', paymentController.stripeWebhook);

module.exports = router;
