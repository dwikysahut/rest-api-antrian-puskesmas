const express = require('express');

const Route = express.Router();
const dokterController = require('../controllers/dokter');
const { authRefreshToken } = require('../middleware/auth');

Route
  .get('/', dokterController.getAllDokter)
  .get('/:id', dokterController.getDokterById)
  .post('/', dokterController.postDokter)
  .put('/:id', dokterController.putDokter)
  .delete('/:id', dokterController.deleteDokter);

module.exports = Route;
