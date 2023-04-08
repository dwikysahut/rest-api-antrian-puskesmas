const express = require('express');

const Route = express.Router();
const antrianController = require('../controllers/antrian');
const { authentication, authorization } = require('../middleware/auth');

Route
  .get('/', antrianController.getAllAntrianByFilter)
  .get('/:id', authentication, antrianController.getAntrianById)
  .get('/all/user', authentication, antrianController.getAntrianByUserId)
  .get('/kartu-keluarga/:id', authentication, antrianController.getAntrianByNoKK)
  .get('/check/available', antrianController.getInformasiAntrianSementara)
  .get('/check/kuota/available', antrianController.getInformasiKuotaAntrian)
  .get('/all/praktek', antrianController.getAntrianByPraktek)
  .get('/pasien/:id', authentication, antrianController.getAntrianByNik)
  .post('/', authentication, antrianController.postAntrian)
  .post('/petugas', authentication, antrianController.postAntrianByPetugas)
  .put('/:id', authentication, antrianController.putAntrian)
  .put('/status/:id', authentication, antrianController.putStatusAntrian)
  .delete('/:id', authentication, authorization, antrianController.deleteAntrian);

module.exports = Route;
