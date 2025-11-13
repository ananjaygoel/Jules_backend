const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feed');
const authMiddleware = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');

router.get('/config', feedController.getConfig);
router.get('/', feedController.getHomeFeed);
router.get('/series/:id', validateObjectId, feedController.getSeries);
router.get('/episode/:id', authMiddleware, validateObjectId, feedController.getEpisode);
router.get('/episode/:id/peek', authMiddleware, validateObjectId, feedController.peekEpisode);
router.post('/episode/:id/unlock', authMiddleware, validateObjectId, feedController.unlockEpisode);

module.exports = router;
