const express = require('express');

const Route = express.Router();
const antrianController = require('../controllers/antrian');
const { authentication, authorization } = require('../middleware/auth');

Route
  .get('/', authentication, antrianController.getAllAntrianByFilter)
  .get('/:id', authentication, antrianController.getAntrianById)
  .get('/pasien/:id', authentication, antrianController.getAntrianByNik)
  .post('/', authentication, antrianController.postAntrian)
  .put('/:id', authentication, antrianController.putAntrian)
  .delete('/:id', authentication, authorization, antrianController.deleteAntrian);

module.exports = Route;
