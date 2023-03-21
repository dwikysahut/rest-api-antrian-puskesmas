/* eslint-disable radix */
/* eslint-disable camelcase */
const jwt = require('jsonwebtoken');
const connection = require('../config/connection');

module.exports = {

  postDetailRekamMedis: (setData) => new Promise((resolve, reject) => {
    connection.query('INSERT INTO detail_rekam_medis set ?', setData, (error, result) => {
      if (!error) {
        const newResult = {
          id: result.insertId,
          ...setData,
        };
        resolve(newResult);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getAllDetailRekamMedis: () => new Promise((resolve, reject) => {
    connection.query('SELECT * from view_detail_rekam_medis', (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getAllDetailRekamMedisByNoRM: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * from view_detail_rekam_medis WHERE no_rm=?', id, (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getDetailRekamMedisById: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM detail_rekam_medis WHERE id_detail_rekam_medis=?', id, (error, result) => {
      if (!error) {
        console.log(result);
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getDetailRekamMedisByNIK: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM detail_rekam_medis WHERE nik=?', id, (error, result) => {
      if (!error) {
        console.log(result);
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getDetailRekamMedisByNIKAndNoRM: (nik, no_rm) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM detail_rekam_medis WHERE nik=? AND no_RM=?', [nik, no_rm], (error, result) => {
      if (!error) {
        console.log(result);
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
  putDetailRekamMedis: (id_detail_rekam_medis, setData) => new Promise((resolve, reject) => {
    connection.query('UPDATE detail_rekam_medis set ? WHERE id_detail_rekam_medis=?', [setData, id_detail_rekam_medis], (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(id_detail_rekam_medis),
          ...result,
          field: { id: parseInt(id_detail_rekam_medis), ...setData },

        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
  deleteDetailRekamMedis: (id_detail_rekam_medis) => new Promise((resolve, reject) => {
    connection.query('DELETE from detail_rekam_medis WHERE id_detail_rekam_medis=?', id_detail_rekam_medis, (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(id_detail_rekam_medis),
          ...result,
        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
  // getRekamMedisCount: (id) => new Promise((resolve, reject) => {
  //   connection.query('select COUNT(rekam_medis.no_rm) as jumlah_rekam_medis from rekam_medis', id, (error, result) => {
  //     if (!error) {
  //       resolve(result[0]);
  //     } else {
  //       reject(new Error(error));
  //     }
  //   });
  // }),
};
