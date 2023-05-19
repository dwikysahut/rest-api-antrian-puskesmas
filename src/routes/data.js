const express = require('express');

const Route = express.Router();
const dataController = require('../controllers/data');
const { authRefreshToken, authentication, authorization } = require('../middleware/auth');

Route
  .get('/count', authentication, authorization, dataController.getAllDataCount)
  .get('/antrian', authentication, authorization, dataController.getAntrianByMonth);

module.exports = Route;
