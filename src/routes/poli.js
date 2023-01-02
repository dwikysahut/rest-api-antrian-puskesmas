const express = require('express');

const Route = express.Router();

const poliController = require('../controllers/poli');

Route
  .get('/', poliController.getAllPoli)
  .get('/:id', poliController.getPoliById)
  .post('/', poliController.postPoli)
  .put('/:id', poliController.putPoli)
  .delete('/:id', poliController.deletePoli);

module.exports = Route;
