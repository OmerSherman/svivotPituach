const express = require('express');
const router = express.Router();
const roleCheck = require('../middleware/roleCheck');
const attractionsController = require('../controllers/attractions_c');

router.get('/', attractionsController.getAll);
router.get('/:id', attractionsController.getById);

// admin only
router.post('/', roleCheck('admin'), attractionsController.create);

// admin and manager
router.put('/:id', roleCheck('admin', 'manager'), attractionsController.update);

// admin only
router.delete('/:id', roleCheck('admin'), attractionsController.remove);

module.exports = router;