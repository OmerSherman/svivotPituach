const express = require('express');
const router = express.Router();
const checkFields = require('../middleware/checkFields');
const authController = require('../controllers/auth_c');

const LOGIN_FIELDS = ['email', 'password'];

router.post('/login', checkFields(LOGIN_FIELDS), authController.login);

// no real session yet so logout just returns ok
router.post('/logout', function(req, res) {
    return res.status(200).json({
        success: true,
        data: { message: "logged out" },
        error: null
    });
});

module.exports = router;
