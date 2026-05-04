const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favorites_c');

// get all favorites for a user
router.get('/', favoritesController.getFavorites);

// add item to favorites
router.post('/', favoritesController.addFavorite);

module.exports = router;