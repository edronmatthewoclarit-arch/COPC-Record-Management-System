const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// When a user visits GET /api/users/
router.get('/', userController.getUsers);

module.exports = router;