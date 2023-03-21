const express = require('express');

const Route = express.Router();
const detailPraktekController = require('../controllers/detailPraktek');
const { authentication, authorization } = require('../middleware/auth');

Route
  .get('/', authentication, detailPraktekController.getAllDetailPraktek)
  .get('/:id', authentication, authorization, detailPraktekController.getDetailPraktekById)
  .get('/praktek/:id', authentication, authorization, detailPraktekController.getDetailPraktekByIdPraktek)
  .post('/', authentication, authorization, detailPraktekController.postDetailPraktek)
  .put('/:id', authentication, authorization, detailPraktekController.putDetailPraktek)
  .delete('/:id', authentication, authorization, detailPraktekController.deleteDetailPraktek);

module.exports = Route;
