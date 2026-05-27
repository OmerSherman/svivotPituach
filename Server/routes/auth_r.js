// routes/auth_r.js
// the Assignment 3 spec asks for /api/auth/login and /api/auth/logout.
// /login is just an alias of the existing /api/users/login (same controller).
// /logout is a no-op on the server - we have no real session yet.

const express = require('express');
const router = express.Router();
const checkFields = require('../middleware/checkFields');
const authController = require('../controllers/auth_c');

const LOGIN_FIELDS = ['email', 'password'];

// POST /api/auth/login  - same controller as /api/users/login
router.post('/login', checkFields(LOGIN_FIELDS), authController.login);

// POST /api/auth/logout - mock logout (no real session yet, next stage uses JWT)
router.post('/logout', function(req, res) {
    return res.status(200).json({
        success: true,
        data: { message: "logged out" },
        error: null
    });
});

module.exports = router;
