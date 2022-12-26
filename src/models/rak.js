/* eslint-disable camelcase */
const jwt = require('jsonwebtoken');
const connection = require('../config/connection');

module.exports = {

  getRakById: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM rak WHERE id_rak=?', id, (error, result) => {
      if (!error) {
        console.log(result);
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
  postRak: (setData) => new Promise((resolve, reject) => {
    connection.query('INSERT INTO rak set ?', setData, (error, result) => {
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
  getAllRak: () => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM rak', (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  putRak: (id_rak, setData) => new Promise((resolve, reject) => {
    connection.query('UPDATE rak set ? WHERE id_rak=?', [setData, id_rak], (error, result) => {
      if (!error) {
        const newData = {
          id: id_rak,
          ...setData,
        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
  deleteRak: (id_rak) => new Promise((resolve, reject) => {
    connection.query('DELETE from rak WHERE id_rak=?', id_rak, (error, result) => {
      if (!error) {
        const newData = {
          id: id_rak,
          ...result,
        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
};
