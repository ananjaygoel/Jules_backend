const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const authMiddleware = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const path = require('path');

router.get('/', authMiddleware, isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/admin.html'));
});

const { createSeriesSchema, createEpisodeSchema, createCouponSchema, validationMiddleware } = require('../middleware/validation');

router.post('/series', authMiddleware, isAdmin, validationMiddleware(createSeriesSchema), adminController.createSeries);
router.put('/series/:id', authMiddleware, isAdmin, adminController.updateSeries);
router.delete('/series/:id', authMiddleware, isAdmin, adminController.deleteSeries);

router.post('/episodes', authMiddleware, isAdmin, validationMiddleware(createEpisodeSchema), adminController.createEpisode);
router.put('/episodes/:id', authMiddleware, isAdmin, adminController.updateEpisode);
router.delete('/episodes/:id', authMiddleware, isAdmin, adminController.deleteEpisode);

router.post('/coupons', authMiddleware, isAdmin, validationMiddleware(createCouponSchema), adminController.createCoupon);
router.delete('/coupons/:id', authMiddleware, isAdmin, adminController.deleteCoupon);

router.post('/assign-admin-role', authMiddleware, isAdmin, adminController.assignAdminRole);

module.exports = router;
