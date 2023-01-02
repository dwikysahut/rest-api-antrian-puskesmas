const express = require('express');

const Route = express.Router();
const rekamMedisController = require('../controllers/rekamMedis');
// const { authRefreshToken } = require('../middleware/auth');

Route
  .get('/', rekamMedisController.getAllRekamMedis)
  .get('/:id', rekamMedisController.getRekamMedisById)
  .post('/', rekamMedisController.postRekamMedis)
  .put('/:id', rekamMedisController.putRekamMedis)
  .delete('/:id', rekamMedisController.deleteRekamMedis);

module.exports = Route;
