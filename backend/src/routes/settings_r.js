const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings_c');

router.get('/',  settingsController.getSettings);
router.put('/',  settingsController.updateSettings);

module.exports = router;
