const express = require('express');

const Route = express.Router();
const informasiController = require('../controllers/informasi');
const { imageUpload } = require('../middleware/imageUpload');
const { authRefreshToken } = require('../middleware/auth');
const { authentication, authorization } = require('../middleware/auth');

Route
  .get('/source/db', authentication, informasiController.getAllInformasiFromDB)
  .get('/', authentication, informasiController.getAllInformasi)
  .get('/source/instagram', authentication, informasiController.getAllInformasiFromInstagram)
  .get('/:id', authentication, informasiController.getInformasiById)
  .post('/', authentication, authorization, imageUpload, informasiController.postInformasi)
  .get('/instagram/generate-token', informasiController.generateToken)
  .put('/:id', authentication, authorization, imageUpload, informasiController.putInformasi)
  .delete('/:id', authentication, authorization, informasiController.deleteInformasi);

module.exports = Route;
