const express = require('express');

const Route = express.Router();
const detailAntrianController = require('../controllers/detailAntrian');
const { authRefreshToken } = require('../middleware/auth');

Route
  .get('/', detailAntrianController.getAllDetailAntrian)
  .get('/:id', detailAntrianController.getDetailAntrianById)
  .get('/antrian/:id', detailAntrianController.getDetailAntrianByIdAntrian)
  .post('/', detailAntrianController.postDetailAntrian)
  .put('/:id', detailAntrianController.putDetailAntrian)
  .delete('/:id', detailAntrianController.deleteDetailAntrian);

module.exports = Route;
