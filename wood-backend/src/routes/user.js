const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { registerSchema, validationMiddleware } = require('../middleware/validation');

router.post('/register', validationMiddleware(registerSchema), userController.register);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);

module.exports = router;
