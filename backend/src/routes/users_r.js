const express = require('express');
const router = express.Router();
const roleCheck = require('../middleware/roleCheck');
const checkFields = require('../middleware/checkFields');
const usersController = require('../controllers/users_c');
const authController = require('../controllers/auth_c');


const CREATE_USER_FIELDS = ['firstName', 'lastName', 'userRole'];


// /me must come before /:id (otherwise "me" is treated as id)
router.get('/me', usersController.getMe);
router.put('/me', usersController.updateMe)

// admin only
router.post('/', roleCheck('admin'), checkFields(CREATE_USER_FIELDS), usersController.create);
router.get('/', roleCheck('admin'), usersController.getAll);
router.get('/:id', usersController.getById);

// admin and manager update others 
router.put('/:id', roleCheck('admin', 'manager'), usersController.update);

// admin can delete anyone, user can only delete themselves
router.delete('/:id', usersController.remove);

module.exports = router;
