const express = require('express');

const Route = express.Router();
const rakController = require('../controllers/rak');
const { authentication, authorization } = require('../middleware/auth');

Route
  .get('/', authentication, rakController.getAllRak)
  .get('/:id', authentication, rakController.getRakById)
  .post('/', authentication, authorization, rakController.postRak)
  .put('/:id', authentication, authorization, rakController.putRak)
  .delete('/:id', authentication, authorization, rakController.deleteRak);

module.exports = Route;
