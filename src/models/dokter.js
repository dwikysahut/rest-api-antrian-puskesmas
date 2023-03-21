/* eslint-disable radix */
/* eslint-disable camelcase */
const jwt = require('jsonwebtoken');
const connection = require('../config/connection');

module.exports = {

  getDokterById: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM dokter WHERE id_dokter=?', id, (error, result) => {
      if (!error) {
        console.log(result);
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
  postDokter: (setData) => new Promise((resolve, reject) => {
    connection.query('INSERT INTO dokter set ?', setData, (error, result) => {
      if (!error) {
        const newResult = {
          id: parseInt(setData.id_dokter),
          ...setData,
        };
        resolve(newResult);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getAllDokter: () => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM dokter', (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  putDokter: (id_dokter, setData) => new Promise((resolve, reject) => {
    connection.query('UPDATE dokter set ? WHERE id_dokter=?', [setData, id_dokter], (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(id_dokter),
          ...result,
          field: { id: parseInt(id_dokter), ...setData },

        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
  deleteDokter: (id_dokter) => new Promise((resolve, reject) => {
    connection.query('DELETE from dokter WHERE id_dokter=?', id_dokter, (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(id_dokter),
          ...result,
        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getDokterCount: (id) => new Promise((resolve, reject) => {
    connection.query('select COUNT(*) as jumlah_dokter from dokter', id, (error, result) => {
      if (!error) {
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
};
