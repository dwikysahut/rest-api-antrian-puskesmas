const express = require('express');

const Route = express.Router();
const kartuKeluargaController = require('../controllers/kartuKeluarga');
const { authentication, authorization } = require('../middleware/auth');

Route
  .get('/', authentication, kartuKeluargaController.getAllKartuKeluarga)
  .get('/:id', authentication, kartuKeluargaController.getnoKKByID)
  .post('/', authentication, kartuKeluargaController.postKartuKeluarga)
  .put('/:id', authentication, kartuKeluargaController.putKartuKeluarga)
  .delete('/:id', authentication, authorization, kartuKeluargaController.deleteKartuKeluarga);

module.exports = Route;
