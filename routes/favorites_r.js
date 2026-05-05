const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favorites_c');
const checkRequiredFields = require('../middleware/checkFields');


// get all favorites for a user
router.get('/', favoritesController.getFavorites);

// add item to favorites
router.post('/', favoritesController.addFavorite);

// delete item from favorites
router.delete('/:id', favoritesController.removeFavorite);

module.exports = router;