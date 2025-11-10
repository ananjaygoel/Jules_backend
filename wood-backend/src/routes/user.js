const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { registerSchema, validationMiddleware } = require('../middleware/validation');
const authMiddleware = require('../middleware/auth');

router.post('/register', validationMiddleware(registerSchema), userController.register);
router.get('/me', authMiddleware, userController.getUser);
router.put('/me', authMiddleware, userController.updateUser);

module.exports = router;
