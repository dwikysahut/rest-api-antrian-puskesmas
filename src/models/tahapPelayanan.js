/* eslint-disable radix */
/* eslint-disable camelcase */
const jwt = require('jsonwebtoken');
const connection = require('../config/connection');

module.exports = {

  getTahapPelayananById: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM tahap_pelayanan WHERE id_tahap_pelayanan=?', id, (error, result) => {
      if (!error) {
        console.log(result);
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
  postTahapPelayanan: (setData) => new Promise((resolve, reject) => {
    connection.query('INSERT INTO tahap_pelayanan set ?', setData, (error, result) => {
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
  getAllTahapPelayanan: () => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM tahap_pelayanan', (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  putTahapPelayanan: (id_tahap_pelayanan, setData) => new Promise((resolve, reject) => {
    connection.query('UPDATE tahap_pelayanan set ? WHERE id_tahap_pelayanan=?', [setData, id_tahap_pelayanan], (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(id_tahap_pelayanan),
          ...result,
          field: { id: parseInt(id_tahap_pelayanan), ...setData },

        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
  deleteTahapPelayanan: (id_tahap_pelayanan) => new Promise((resolve, reject) => {
    connection.query('DELETE from tahap_pelayanan WHERE id_tahap_pelayanan=?', id_tahap_pelayanan, (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(id_tahap_pelayanan),
          ...result,
        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
};
