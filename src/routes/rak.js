const express = require('express');

const Route = express.Router();
const rakController = require('../controllers/rak');
const { authRefreshToken } = require('../middleware/auth');

Route
  .get('/', rakController.getAllRak)
  .get('/:id', rakController.getRakById)
  .post('/', rakController.postRak)
  .put('/:id', rakController.putRak)
  .delete('/:id', rakController.deleteRak);

module.exports = Route;
