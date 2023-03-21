const express = require('express');

const Route = express.Router();
const dokterController = require('../controllers/dokter');
const { authRefreshToken, authentication, authorization } = require('../middleware/auth');

Route
  .get('/', authentication, dokterController.getAllDokter)
  .get('/:id', authentication, dokterController.getDokterById)
  .post('/', authentication, authorization, dokterController.postDokter)
  .put('/:id', authentication, authorization, dokterController.putDokter)
  .delete('/:id', authentication, authorization, dokterController.deleteDokter);

module.exports = Route;
