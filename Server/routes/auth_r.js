const express = require('express');
const router = express.Router();
const checkFields = require('../middleware/checkFields');
const authController = require('../controllers/auth_c');

const REGISTER_FIELDS = ['firstName', 'lastName', 'email', 'password'];
const LOGIN_FIELDS = ['email', 'password'];

// open to everyone
router.post('/register', checkFields(REGISTER_FIELDS), authController.register);
router.post('/login', checkFields(LOGIN_FIELDS), authController.login);

// no real session yet so logout just returns ok
router.post('/logout', function(req, res) {
   
});

module.exports = router;
