const express = require('express');
const router = express.Router();
const countriesController = require('../controllers/countries_c');

router.get('/', countriesController.getAll);
router.get('/:id', countriesController.getById);

module.exports = router;
