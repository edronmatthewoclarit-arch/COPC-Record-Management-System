const express = require('express');
const router = express.Router();
const { loginUser, logoutUser, registerUser } = require('../controllers/userController');

router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/register', registerUser);

module.exports = router;
