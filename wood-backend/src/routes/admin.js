const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const authMiddleware = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const path = require('path');
const { createSeriesSchema, createEpisodeSchema, createCouponSchema, assignAdminRoleSchema, validationMiddleware, validateObjectId } = require('../middleware/validation');

router.get('/', authMiddleware, isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/admin.html'));
});

router.post('/series', authMiddleware, isAdmin, validationMiddleware(createSeriesSchema), adminController.createSeries);
router.put('/series/:id', authMiddleware, isAdmin, validateObjectId, adminController.updateSeries);
router.delete('/series/:id', authMiddleware, isAdmin, validateObjectId, adminController.deleteSeries);

router.post('/episodes', authMiddleware, isAdmin, validationMiddleware(createEpisodeSchema), adminController.createEpisode);
router.put('/episodes/:id', authMiddleware, isAdmin, validateObjectId, adminController.updateEpisode);
router.delete('/episodes/:id', authMiddleware, isAdmin, validateObjectId, adminController.deleteEpisode);

router.post('/coupons', authMiddleware, isAdmin, validationMiddleware(createCouponSchema), adminController.createCoupon);
router.delete('/coupons/:id', authMiddleware, isAdmin, validateObjectId, adminController.deleteCoupon);

router.post('/assign-admin-role', authMiddleware, isAdmin, validationMiddleware(assignAdminRoleSchema), adminController.assignAdminRole);

module.exports = router;
