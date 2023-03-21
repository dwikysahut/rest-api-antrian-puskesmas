/* eslint-disable radix */
const jwt = require('jsonwebtoken');
const helper = require('../helpers');
require('dotenv').config();

module.exports = {
  authentication: (request, response, next) => {
    const bearerToken = request.headers.authorization !== undefined ? request.headers.authorization.split(' ') : '';
    const token = bearerToken ? bearerToken[1] : null;
    console.log(bearerToken);

    jwt.verify(token, process.env.SECRET_KEY, (error, result) => {
      if ((error && error.name === 'TokenExpiredError') || (error && error.name === 'JsonWebTokenError')) {
        helper.response(response, 401, { message: error.name });
      } else {
        request.token = result;
        // console.log(request.token);
        next();
      }
    });
  },
  authorization: (request, response, next) => {
    const token = request.headers.authorization;
    jwt.verify(token, process.env.SECRET_KEY, (error, result) => {
      console.log(request.token);
      let role;
      if (request.token.result.role === undefined) {
        console.log(request.token.result.result.role);
        role = request.token.result.result.role;
      } else {
        role = request.token.result.role;
      }
      if (parseInt(role) > 1) {
        helper.response(response, 401, { message: 'You don\'t have accesss' });
      } else {
        request.token = result;
        next();
      }
    });
  },
  authorizationAdmin: (request, response, next) => {
    const token = request.headers.authorization;
    jwt.verify(token, process.env.SECRET_KEY, (error, result) => {
      // console.log(request.token);
      let role;
      if (request.token.result.role === undefined) {
        // console.log(request.token.result.result.role);
        role = request.token.result.result.role;
      } else {
        role = request.token.result.role;
      }
      if (parseInt(role) > 1) {
        helper.response(response, 401, { message: 'You don\'t have accesss' });
      } else {
        request.token = result;
        next();
      }
    });
  },
  authRefreshToken: (request, response, next) => {
    const { refreshToken } = request.body;
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY, (error, result) => {
      if ((error && error.name === 'TokenExpiredError')
        || (error && error.name === 'JsonWebTokenError')) {
        helper.response(response, 401, {}, { message: error.name });
      } else {
        request.token = result;
        next();
      }
    });
  },
};
