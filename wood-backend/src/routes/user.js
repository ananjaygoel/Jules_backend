const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { registerSchema, updateUserSchema, validationMiddleware } = require('../middleware/validation');
const authMiddleware = require('../middleware/auth');

router.post('/register', validationMiddleware(registerSchema), userController.register);
router.get('/me', authMiddleware, userController.getUser);
router.put('/me', authMiddleware, validationMiddleware(updateUserSchema), userController.updateUser);

module.exports = router;
