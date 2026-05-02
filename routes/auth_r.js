const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth_c');

// POST /api/auth/register 
// open to everyone
router.post('/register', authController.register);

// POST /api/auth/login 
// open to everyone
router.post('/login', authController.login);

module.exports = router;