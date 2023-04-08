/* eslint-disable radix */
/* eslint-disable camelcase */
const connection = require('../config/connection');

module.exports = {

  getPasienById: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM view_pasien WHERE nik=?', id, (error, result) => {
      if (!error) {
        console.log(result);
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),

  getPasienAntrianById: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM view_pasien_antrian WHERE nik=?', id, (error, result) => {
      if (!error) {
        console.log(result);
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),

  getPasienAntrianByIdAndKk: (id, no_kk) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM view_pasien_antrian WHERE nik=? and no_kk=?', [id, no_kk], (error, result) => {
      if (!error) {
        console.log(result);
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getAllPasienByNoRM: (id) => new Promise((resolve, reject) => {
    connection.query('select pasien.*,rekam_medis.no_rm,kartu_keluarga.no_kk from pasien INNER JOIN  kartu_keluarga on kartu_keluarga.no_kk=pasien.no_kk INNER JOIN rekam_medis on rekam_medis.no_rm=kartu_keluarga.no_rm where rekam_medis.no_rm=?', id, (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getAllPasienByNoRMNotInput: (id) => new Promise((resolve, reject) => {
    connection.query('select pasien.*,rekam_medis.no_rm,kartu_keluarga.no_kk from pasien INNER JOIN  kartu_keluarga on kartu_keluarga.no_kk=pasien.no_kk INNER JOIN rekam_medis on rekam_medis.no_rm=kartu_keluarga.no_rm where rekam_medis.no_rm=?', id, (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getAllPasienByNoKK: (id) => new Promise((resolve, reject) => {
    connection.query('select pasien.*,rekam_medis.no_rm,kartu_keluarga.no_kk,kartu_keluarga.kepala_keluarga from pasien LEFT JOIN  kartu_keluarga on kartu_keluarga.no_kk=pasien.no_kk LEFT JOIN rekam_medis on rekam_medis.no_rm=kartu_keluarga.no_rm where kartu_keluarga.no_kk=?', id, (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  postPasien: (setData) => new Promise((resolve, reject) => {
    connection.query('INSERT INTO pasien set ?', setData, (error, result) => {
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
  getAllPasien: () => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM view_pasien', (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),

  putPasien: (nik, setData) => new Promise((resolve, reject) => {
    connection.query('UPDATE pasien set ? WHERE nik=?', [setData, nik], (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(nik),
          ...result,
          field: { id: parseInt(nik), ...setData },

        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
  deletePasien: (nik) => new Promise((resolve, reject) => {
    connection.query('DELETE from pasien WHERE nik=?', nik, (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(nik),
          ...result,
        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getPasienCount: (id) => new Promise((resolve, reject) => {
    connection.query('select COUNT(pasien.nik) as jumlah_pasien from pasien', id, (error, result) => {
      if (!error) {
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
};
