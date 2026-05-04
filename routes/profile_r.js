const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile_c');

// POST /api/profile - save traveler preferences (used for personalized recommendations)
router.post('/', profileController.saveProfile);

module.exports = router;