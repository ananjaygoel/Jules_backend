const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

router.post('/register', userController.register);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);

module.exports = router;
