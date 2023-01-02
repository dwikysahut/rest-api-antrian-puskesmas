const express = require('express');

const Route = express.Router();
const informasiController = require('../controllers/informasi');
const { imageUpload } = require('../middleware/imageUpload');
const { authRefreshToken } = require('../middleware/auth');

Route
  .get('/source/db', informasiController.getAllInformasiFromDB)
  .get('/', informasiController.getAllInformasi)
  .get('/source/instagram', informasiController.getAllInformasiFromInstagram)
  .get('/:id', informasiController.getInformasiById)
  .post('/', imageUpload, informasiController.postInformasi)
  .get('/instagram/generate-token', imageUpload, informasiController.generateToken)
  .put('/:id', imageUpload, informasiController.putInformasi)
  .delete('/:id', informasiController.deleteInformasi);

module.exports = Route;
