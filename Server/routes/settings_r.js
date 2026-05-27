// routes/settings_r.js
// GET  /api/settings -> current user's settings
// PUT  /api/settings -> update current user's settings
// Required by Assignment 3.

const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings_c');

router.get('/',  settingsController.getSettings);
router.put('/',  settingsController.updateSettings);

module.exports = router;
