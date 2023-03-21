/* eslint-disable no-mixed-operators */
const jwt = require('jsonwebtoken');
const connection = require('../config/connection');

module.exports = {
  getUserByEmail: (email) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM USERS WHERE email=?', email, (error, result) => {
      if (!error) {
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getUserByNIK: (nik) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM users WHERE user_id=?', nik, (error, result) => {
      if (!error) {
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),

  getUserBynoKK: (noKK) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM kartu_keluarga WHERE no_kk=?', noKK, (error, result) => {
      if (!error) {
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
  createAccount: (setData) => new Promise((resolve, reject) => {
    connection.query('INSERT INTO USERS set ?', setData, (error, result) => {
      if (!error) {
        const newResult = {
          id: result.insertId,
          ...setData,
        };
        delete newResult.password;
        resolve(newResult);
      } else {
        reject(new Error(error));
      }
    });
  }),
  refreshToken: (token) => new Promise((resolve, reject) => {
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET_KEY, (error, result) => {
      if ((error && error.name === 'TokenExpiredError') || (error && error.name === 'JsonWebTokenError')) {
        reject(new Error(error));
      } else {
        console.log(result);
        resolve(result.result);
      }
    });
  }),
  forgotPassword: (userId, password) => new Promise((resolve, reject) => {
    connection.query(`UPDATE USERS SET PASSWORD='${password}' where USER_ID='${userId}'`, (error, result) => {
      if (!error) {
        const newResult = {
          userId,
          result,
        };
        resolve(newResult);
      } else {
        reject(new Error(error));
      }
    });
  }),
  verifyUserEmail: (userId) => new Promise((resolve, reject) => {
    connection.query('UPDATE USERS SET VERIF_EMAIL=1 WHERE USER_ID=?', userId, (error, result) => {
      if (!error) {
        const newResult = {
          userId,
          result,
        };
        resolve(newResult);
      } else {
        reject(new Error(error));
      }
    });
  }),
  verifyUserAccount: (userId) => new Promise((resolve, reject) => {
    connection.query('UPDATE USERS SET VERIF_AKUN=1 WHERE USER_ID=?', userId, (error, result) => {
      if (!error) {
        const newResult = {
          userId,
          result,
        };
        resolve(newResult);
      } else {
        reject(new Error(error));
      }
    });
  }),

};
