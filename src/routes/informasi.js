const express = require('express');

const Route = express.Router();
const informasiController = require('../controllers/informasi');
const { imageUpload } = require('../middleware/imageUpload');
const { authRefreshToken } = require('../middleware/auth');

Route
  .get('/', informasiController.getAllInformasi)
  .get('/:id', informasiController.getInformasiById)
  .post('/', imageUpload, informasiController.postInformasi)
  .put('/:id', imageUpload, informasiController.putInformasi)
  .delete('/:id', informasiController.deleteInformasi);

module.exports = Route;
