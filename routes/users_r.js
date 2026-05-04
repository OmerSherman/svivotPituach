const express = require('express');
const router = express.Router();
const roleCheck = require('../middleware/roleCheck');
const usersController = require('../controllers/User_controller');

// admin only
router.get('/', roleCheck('admin'), usersController.getAll);
router.get('/:id', usersController.getById);

// admin only
router.post('/', roleCheck('admin'), usersController.create);

// admin and manager
router.put('/:id', roleCheck('admin', 'manager'), usersController.update);

// admin only
router.delete('/:id', roleCheck('admin'), usersController.remove);

module.exports = router;