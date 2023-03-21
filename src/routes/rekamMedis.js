const express = require('express');

const Route = express.Router();
const rekamMedisController = require('../controllers/rekamMedis');
// const { authRefreshToken } = require('../middleware/auth');
const { authentication, authorization } = require('../middleware/auth');

Route
  .get('/', authentication, rekamMedisController.getAllRekamMedis)
  .get('/:id', authentication, rekamMedisController.getRekamMedisById)
  .post('/', authentication, authorization, rekamMedisController.postRekamMedis)
  .put('/:id', authentication, authorization, rekamMedisController.putRekamMedis)
  .delete('/:id', authentication, authorization, rekamMedisController.deleteRekamMedis);

module.exports = Route;
