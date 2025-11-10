const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feed');
const authMiddleware = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');

router.get('/', feedController.getHomeFeed);
router.get('/series/:id', validateObjectId, feedController.getSeries);
router.get('/episode/:id', authMiddleware, validateObjectId, feedController.getEpisode);

module.exports = router;
