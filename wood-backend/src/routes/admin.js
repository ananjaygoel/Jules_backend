const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const authMiddleware = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.post('/series', authMiddleware, isAdmin, adminController.createSeries);
router.put('/series/:id', authMiddleware, isAdmin, adminController.updateSeries);
router.delete('/series/:id', authMiddleware, isAdmin, adminController.deleteSeries);

router.post('/episodes', authMiddleware, isAdmin, adminController.createEpisode);
router.put('/episodes/:id', authMiddleware, isAdmin, adminController.updateEpisode);
router.delete('/episodes/:id', authMiddleware, isAdmin, adminController.deleteEpisode);

module.exports = router;
