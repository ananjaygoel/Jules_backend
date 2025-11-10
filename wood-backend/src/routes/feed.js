const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feed');
const authMiddleware = require('../middleware/auth');

router.get('/', feedController.getHomeFeed);
router.get('/series/:id', feedController.getSeries);
router.get('/episode/:id', authMiddleware, feedController.getEpisode);

module.exports = router;
