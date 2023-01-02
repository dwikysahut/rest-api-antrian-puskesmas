const express = require('express');

const Route = express.Router();

const usersController = require('../controllers/users');

Route
  .get('/', usersController.getAllUsers)
  .get('/:id', usersController.getUserById)
  .post('/', usersController.postUser)
  .put('/:id', usersController.putUser)
  .delete('/:id', usersController.deleteUser);

module.exports = Route;
