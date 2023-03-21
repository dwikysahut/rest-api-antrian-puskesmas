const express = require('express');

const Route = express.Router();
const detailRekamMedisController = require('../controllers/detailRekamMedis');
// const { authRefreshToken } = require('../middleware/auth');
const { authentication, authorization } = require('../middleware/auth');

Route
  .get('/', authentication, detailRekamMedisController.getAllDetailRekamMedis)
  .get('/rekam-medis/:id', authentication, detailRekamMedisController.getAllDetailRekamMedisByNoRM)
  .post('/', authentication, authorization, detailRekamMedisController.postDetailRekamMedis)
  .put('/:id', authentication, authorization, detailRekamMedisController.putDetailRekamMedis)
  .delete('/:id', authentication, authorization, detailRekamMedisController.deleteDetailRekamMedis);

module.exports = Route;
