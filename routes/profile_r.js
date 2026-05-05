const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile_c');
const checkFields = require("../middleware/checkFields")

// save traveler preferences (used for personalized recommendations)
const PROFILE_REQ = ["userId","travelerType","interests", "budgetLevel"  ]
router.post('/', checkFields(PROFILE_REQ), profileController.saveProfile);

//todo delete profile 

module.exports = router;