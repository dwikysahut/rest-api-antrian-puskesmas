const express = require('express');

const Route = express.Router();
const praktekController = require('../controllers/praktek');
const { authentication, authorization } = require('../middleware/auth');

Route
  .get('/', authentication, praktekController.getAllPraktek)
  .get('/:id', authentication, praktekController.getPraktekById)
  .post('/', authentication, authorization, praktekController.postPraktek)
  .put('/:id', authentication, authorization, praktekController.putPraktek)
  .delete('/:id', authentication, authorization, praktekController.deletePraktek);

module.exports = Route;
