const express = require('express');

const Route = express.Router();

const notifikasiController = require('../controllers/notifikasi');
const { authentication, authorization } = require('../middleware/auth');

Route
  .get('/', authentication, notifikasiController.getAllNotifikasi)
  .get('/:id', authentication, notifikasiController.getNotifikasiById)
  .get('/user/:id', authentication, notifikasiController.getNotifikasiByUser)
  .post('/', authentication, notifikasiController.postNotifikasi)
  .post('/reverse/request', authentication, notifikasiController.postReverseRequest)
  .put('/reverse/response/:id', authentication, notifikasiController.putActionReverseRequest)
  .post('/reverse/offline/response', authentication, notifikasiController.postReverseWithOfflineQueue)
  .put('/:id', authentication, notifikasiController.putNotifikasi);
// .delete('/:id',authentication, notifikasiController.deleteNotifikasi);

module.exports = Route;
