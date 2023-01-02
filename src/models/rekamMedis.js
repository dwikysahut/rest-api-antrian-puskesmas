/* eslint-disable radix */
/* eslint-disable camelcase */
const jwt = require('jsonwebtoken');
const connection = require('../config/connection');

module.exports = {

  getRekamMedisById: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT rekam_medis.*,rak.kode_rak FROM rekam_medis INNER JOIN rak ON rekam_medis.id_rak=rak.id_rak WHERE no_rm=?', id, (error, result) => {
      if (!error) {
        console.log(result);
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
  postRekamMedis: (setData) => new Promise((resolve, reject) => {
    connection.query('INSERT INTO rekam_medis set ?', setData, (error, result) => {
      if (!error) {
        const newResult = {
          id: parseInt(setData.no_rm),
          ...setData,
        };
        delete newResult.password;
        resolve(newResult);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getAllRekamMedis: () => new Promise((resolve, reject) => {
    connection.query('SELECT rekam_medis.*,rak.kode_rak FROM rekam_medis INNER JOIN rak ON rekam_medis.id_rak=rak.id_rak', (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getCountRekamMedisById: (no_rm) => new Promise((resolve, reject) => {
    connection.query('SELECT count(*) as jumlah_anggota FROM detail_rekam_medis WHERE no_rm=?', no_rm, (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  putRekamMedis: (no_rm, setData) => new Promise((resolve, reject) => {
    connection.query('UPDATE rekam_medis set ? WHERE no_rm=?', [setData, no_rm], (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(no_rm),
          ...setData,
        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
  deleteRekamMedis: (no_rm) => new Promise((resolve, reject) => {
    connection.query('DELETE from rekam_medis WHERE no_rm=?', no_rm, (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(no_rm),
          ...result,
        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
};
