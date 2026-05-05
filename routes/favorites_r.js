const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favorites_c');
const checkRequiredFields = require('../middleware/checkFields');


// get all favorites for a user
router.get('/', favoritesController.getFavorites);

// add item to favorites
const REQUIRED_ADDTOFAVORITE = ["userId" ,"itemId", "itemType"]
router.post('/', checkRequiredFields(REQUIRED_ADDTOFAVORITE)  ,favoritesController.addFavorite);

// delete item from favorites
//recives queryParameter userid
//example remove attraction 1 from userid 2 : ".../api/favories/1?userid=2"
router.delete('/:id', favoritesController.removeFavorite);

module.exports = router;