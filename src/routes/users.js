const express = require('express');

const Route = express.Router();

const usersController = require('../controllers/users');
const { authentication, authorization } = require('../middleware/auth');

Route
  .get('/', authentication, usersController.getAllUsers)
  .get('/:id', authentication, authorization, usersController.getUserById)
  .get('/profile/:id', authentication, usersController.getUserProfile)
  .put('/profile/:id', authentication, usersController.putUserProfile)
  .post('/', authentication, authorization, usersController.postUser)
  .put('/:id', authentication, authorization, usersController.putUser)
  .delete('/:id', authentication, authorization, usersController.deleteUser);

module.exports = Route;
