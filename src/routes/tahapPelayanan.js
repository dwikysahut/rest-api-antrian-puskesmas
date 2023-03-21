const express = require('express');

const Route = express.Router();
const tahapPelayananController = require('../controllers/tahapPelayanan');
const { authentication, authorization } = require('../middleware/auth');

Route
  .get('/', authentication, tahapPelayananController.getAllTahapPelayanan)
  .get('/:id', authentication, tahapPelayananController.getTahapPelayananById)
  .post('/', authentication, authorization, tahapPelayananController.postTahapPelayanan)
  .put('/:id', authentication, authorization, tahapPelayananController.putTahapPelayanan)
  .delete('/:id', authentication, authorization, tahapPelayananController.deleteTahapPelayanan);

module.exports = Route;
