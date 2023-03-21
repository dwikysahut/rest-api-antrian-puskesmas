const express = require('express');

const Route = express.Router();

const notifikasiController = require('../controllers/notifikasi');

Route
  .get('/', notifikasiController.getAllNotifikasi)
  .get('/:id', notifikasiController.getNotifikasiById)
  .get('/user/:id', notifikasiController.getNotifikasiByUser)
  .post('/', notifikasiController.postNotifikasi)
  .put('/:id', notifikasiController.putNotifikasi)
  .delete('/:id', notifikasiController.deleteNotifikasi);

module.exports = Route;
