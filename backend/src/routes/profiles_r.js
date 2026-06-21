const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profiles_c');
const checkFields = require("../middleware/checkFields")

// save traveler preferences (used for personalized recommendations)
const REQUIRED = ["name", "countryId", "startMonth", "endMonth", "travelerType", "budgetLevel"];

router.get('/', profileController.getAll);
router.get('/:id', profileController.getById);
router.post('/', checkFields(REQUIRED), profileController.create);
router.put('/:id', profileController.update);
router.delete('/:id', profileController.remove);
router.post('/:id/favorites', profileController.toggleFavorite);

module.exports = router;