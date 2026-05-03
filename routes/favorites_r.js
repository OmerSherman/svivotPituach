const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favorites_c');

// GET /api/favorites?userId=1 
// get all favorites for a user
router.get('/', favoritesController.getFavorites);

// POST /api/favorites 
// add item to favorites
router.post('/', favoritesController.addFavorite);

module.exports = router;