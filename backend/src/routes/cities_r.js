const express = require('express');
const router = express.Router();
const citiesController = require('../controllers/cities_c');

// get all cities
router.get('/', citiesController.getAll);

// search by name
// must be before /:id or express will treat it as an id param
router.get('/search', citiesController.search);

// get one city
router.get('/:id', citiesController.getById);

module.exports = router;