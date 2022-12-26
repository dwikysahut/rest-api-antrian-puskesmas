const express = require('express');

const Route = express.Router();
const authController = require('../controllers/auth');
const { authRefreshToken } = require('../middleware/auth');

Route
  .post('/register', authController.createAccount)
  .post('/email-verify', authController.verifyUserEmail)
  .post('/forgot-password', authController.forgotPassword)
  .post('/login', authController.login)
  .post('/refresh-token', authController.refreshToken)
  .post('/logout', authController.deleteToken);

module.exports = Route;
