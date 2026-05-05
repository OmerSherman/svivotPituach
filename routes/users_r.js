const express = require('express');
const router = express.Router();
const roleCheck = require('../middleware/roleCheck');
const usersController = require('../controllers/User_controller');
const authController = require('../controllers/auth_c');
const checkRequiredFields = require('../middleware/checkFields');

// open to everyone
const REGISTER_FIELDS = ['firstName', 'lastName', 'email', 'password'];
router.post('/register', checkRequiredFields(REGISTER_FIELDS), authController.register);

const LOGIN_FIELDS = ['email', 'password'];
router.post('/login', checkRequiredFields(LOGIN_FIELDS), authController.login);


// admin only
router.get('/', roleCheck('admin'), usersController.getAll);
router.get('/:id', usersController.getById);


// admin and manager
router.put('/:id', roleCheck('admin', 'manager'), usersController.update);

//admin can delete anyone, users can onlu delete himselfe
router.delete('/:id', usersController.remove); //delete user


module.exports = router;