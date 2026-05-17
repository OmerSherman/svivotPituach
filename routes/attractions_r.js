const express = require('express');
const router = express.Router();
const roleCheck = require('../middleware/roleCheck');
const checkFields = require('../middleware/checkFields');
const attractionsController = require('../controllers/attractions_c');

const ATTRACTION_FIELDS = ["city_id", "name", "name_he", "type", "description_he"];

router.get('/', attractionsController.getAll);
// map pins for a city - used by the map component in the frontend
router.get('/map', attractionsController.getMapData);
router.get('/:id', attractionsController.getById);

// admin only
router.post('/', roleCheck('admin'), checkFields(ATTRACTION_FIELDS), attractionsController.create);

// admin and manager
router.put('/:id', roleCheck('admin', 'manager'), attractionsController.update);

// admin only
router.delete('/:id', roleCheck('admin'), attractionsController.remove);

module.exports = router;
