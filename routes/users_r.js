const express = require('express');
const router = express.Router();
const roleCheck = require('../middleware/roleCheck');
const usersController = require('../controllers/User_controller');

// GET /api/users - all users (admin only)
router.get('/', roleCheck('admin'), usersController.getAll);

// GET /api/users/:id
router.get('/:id', usersController.getById);

// POST /api/users - create user (admin only)
router.post('/', roleCheck('admin'), usersController.create);

// PUT /api/users/:id - update user (admin and manager)
router.put('/:id', roleCheck('admin', 'manager'), usersController.update);

// DELETE /api/users/:id - delete user (admin only)
router.delete('/:id', roleCheck('admin'), usersController.remove);

module.exports = router;