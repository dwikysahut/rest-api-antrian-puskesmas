const express = require('express');

const Route = express.Router();

const poliController = require('../controllers/poli');
const { authentication, authorization } = require('../middleware/auth');

Route
  .get('/', authentication, poliController.getAllPoli)
  .get('/poli-not-in/:id', authentication, poliController.getPoliNotInPraktek)
  .get('/:id', authentication, poliController.getPoliById)
  .post('/', authentication, authorization, poliController.postPoli)
  .put('/:id', authentication, authorization, poliController.putPoli)
  .delete('/:id', authentication, authorization, poliController.deletePoli);

module.exports = Route;
