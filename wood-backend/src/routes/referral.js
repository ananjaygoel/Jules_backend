const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referral');
const authMiddleware = require('../middleware/auth');

router.post('/generate-code', authMiddleware, referralController.generateCode);
router.post('/enter-code', authMiddleware, referralController.enterCode);

module.exports = router;
