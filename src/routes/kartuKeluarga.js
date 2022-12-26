const express = require('express');

const Route = express.Router();
const kartuKeluargaController = require('../controllers/kartuKeluarga');
const { authRefreshToken } = require('../middleware/auth');

Route
  .get('/', kartuKeluargaController.getAllKartuKeluarga)
  .get('/:id', kartuKeluargaController.getnoKKByID)
  .post('/', kartuKeluargaController.postKartuKeluarga)
  .put('/:id', kartuKeluargaController.putKartuKeluarga)
  .delete('/:id', kartuKeluargaController.deleteKartuKeluarga);

module.exports = Route;
