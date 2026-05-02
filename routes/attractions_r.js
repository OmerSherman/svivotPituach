const express = require('express');
const router = express.Router();
const roleCheck = require('../middleware/roleCheck');
const attractionsController = require('../controllers/attractions_c');

// GET /api/attractions
// get all attractions (all)
router.get('/', attractionsController.getAll);

// GET /api/attractions/:id 
// get only one attraction by id (all)
router.get('/:id', attractionsController.getById);

// POST /api/attractions 
// create new attraction (admin only)
router.post('/', roleCheck('admin'), attractionsController.create);

// PUT /api/attractions/:id 
// update attraction (admin and manager)
router.put('/:id', roleCheck('admin', 'manager'), attractionsController.update);

// DELETE /api/attractions/:id 
// delete attraction (admin only)
router.delete('/:id', roleCheck('admin'), attractionsController.remove);

module.exports = router;