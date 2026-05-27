const express = require('express');
const router = express.Router();
const roleCheck = require('../middleware/roleCheck');
const checkFields = require('../middleware/checkFields');
const usersController = require('../controllers/users_c');
const authController = require('../controllers/auth_c');

const REGISTER_FIELDS = ['firstName', 'lastName', 'email', 'password'];
const LOGIN_FIELDS = ['email', 'password'];
const CREATE_USER_FIELDS = ['firstName', 'lastName', 'userRole'];

// open to everyone
router.post('/register', checkFields(REGISTER_FIELDS), authController.register);
router.post('/login', checkFields(LOGIN_FIELDS), authController.login);

// /me must come before /:id (otherwise "me" is treated as id)
router.get('/me', usersController.getMe);

// admin only
router.post('/', roleCheck('admin'), checkFields(CREATE_USER_FIELDS), usersController.create);
router.get('/', roleCheck('admin'), usersController.getAll);
router.get('/:id', usersController.getById);

// admin and manager
router.put('/:id', roleCheck('admin', 'manager'), usersController.update);

// admin can delete anyone, user can only delete themselves
router.delete('/:id', usersController.remove);

module.exports = router;
