const express = require('express');

const Route = express.Router();

const pasienController = require('../controllers/pasien');
const { authentication, authorization } = require('../middleware/auth');

Route
  .get('/', authentication, pasienController.getAllPasien)
  .get('/:id', authentication, pasienController.getPasienById)
  .get('/antrian/:id', authentication, pasienController.getPasienDataForAntrianByID)
  .get('/antrian/kartu-keluarga/:id', authentication, pasienController.getPasienDataForAntrianByIDAndKk)
  .get('/rekam-medis/:id', authentication, pasienController.getAllPasienByNoRM)
  .get('/rekam-medis/not-input/:id', authentication, pasienController.getAllPasienByNoRMNotInput)
  .get('/kartu-keluarga/:id', authentication, pasienController.getAllPasienByNoKK)
  .post('/', authentication, pasienController.postPasien)
  .put('/:id', authentication, pasienController.putPasien)
  .put('/kartu-identitas/:id', authentication, pasienController.putKartuIdentitasPasien)
  .delete('/:id', authentication, authorization, pasienController.deletePasien);

module.exports = Route;
