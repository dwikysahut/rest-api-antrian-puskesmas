/* eslint-disable radix */
/* eslint-disable camelcase */
const jwt = require('jsonwebtoken');
const connection = require('../config/connection');

module.exports = {

  getnoKKByID: (noKK) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM kartu_keluarga WHERE no_kk=?', noKK, (error, result) => {
      if (!error) {
        // console.log(result);
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
  postKartuKeluarga: (setData) => new Promise((resolve, reject) => {
    connection.query('INSERT INTO kartu_keluarga set ?', setData, (error, result) => {
      if (!error) {
        const newResult = {
          id: parseInt(setData.no_kk),
          ...setData,
        };
        delete newResult.password;
        resolve(newResult);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getAllKartuKeluarga: () => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM kartu_keluarga', (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  putKartuKeluarga: (no_kk, setData) => new Promise((resolve, reject) => {
    connection.query('UPDATE kartu_keluarga set ? WHERE no_kk=?', [setData, no_kk], (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(no_kk),
          ...result,
          field: { id: parseInt(no_kk), ...setData },

        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
  deleteKartuKeluarga: (no_kk) => new Promise((resolve, reject) => {
    connection.query('DELETE from kartu_keluarga WHERE no_kk=?', no_kk, (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(no_kk),
          ...result,
        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getKartuKeluargaCount: (id) => new Promise((resolve, reject) => {
    connection.query('select COUNT(kartu_keluarga.no_kk) as jumlah_kartu_keluarga from kartu_keluarga', id, (error, result) => {
      if (!error) {
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
};
