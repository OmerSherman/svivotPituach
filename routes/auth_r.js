const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth_c');
const checkRequiredFields = require('../middleware/checkFields');

// open to everyone
const REGISTER_FIELDS = ['firstName', 'lastName', 'email', 'password'];
router.post('/register', checkRequiredFields(REGISTER_FIELDS), authController.register);

const LOGIN_FIELDS = ['email', 'password'];
router.post('/login', checkRequiredFields(LOGIN_FIELDS), authController.login);

module.exports = router;