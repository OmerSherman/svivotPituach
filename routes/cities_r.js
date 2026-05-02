const express = require('express');
const router = express.Router();
const citiesController = require('../controllers/cities_c');

// GET /api/cities
// get all cities
router.get('/', citiesController.getAll);

// GET /api/cities/search?q=buenos 
// search by name
router.get('/search', citiesController.search);

// GET /api/cities/:id 
// get one city
router.get('/:id', citiesController.getById);

module.exports = router;