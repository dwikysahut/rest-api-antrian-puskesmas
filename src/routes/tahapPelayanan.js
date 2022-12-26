const express = require('express');

const Route = express.Router();
const tahapPelayananController = require('../controllers/tahapPelayanan');
const { authRefreshToken } = require('../middleware/auth');

Route
  .get('/', tahapPelayananController.getAllTahapPelayanan)
  .get('/:id', tahapPelayananController.getTahapPelayananById)
  .post('/', tahapPelayananController.postTahapPelayanan)
  .put('/:id', tahapPelayananController.putTahapPelayanan)
  .delete('/:id', tahapPelayananController.deleteTahapPelayanan);

module.exports = Route;
