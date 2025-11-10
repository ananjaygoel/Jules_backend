const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks');
const authMiddleware = require('../middleware/auth');

// One-time tasks
router.post('/onetime/complete-profile', authMiddleware, tasksController.completeProfile);
router.post('/onetime/follow-social', authMiddleware, tasksController.followSocialMedia);

// Monthly tasks
router.post('/monthly/bonus', authMiddleware, tasksController.monthlyBonus);

// Daily tasks
router.post('/daily/watch-ad', authMiddleware, tasksController.watchAd);

// Ambitious tasks
router.post('/ambitious/spin-wheel', authMiddleware, tasksController.spinWheel);

module.exports = router;
