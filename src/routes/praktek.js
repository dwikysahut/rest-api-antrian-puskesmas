const express = require('express');

const Route = express.Router();
const praktekController = require('../controllers/praktek');
const { authentication, authorization } = require('../middleware/auth');

Route
  .get('/', praktekController.getAllPraktek)
  .get('/:id', authentication, praktekController.getPraktekById)
  .post('/', authentication, authorization, praktekController.postPraktek)
  .put('/:id', authentication, praktekController.putPraktek)
  .delete('/:id', authentication, authorization, praktekController.deletePraktek);

module.exports = Route;
