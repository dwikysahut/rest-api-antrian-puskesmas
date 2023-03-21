/* eslint-disable no-param-reassign */
/* eslint-disable radix */
/* eslint-disable camelcase */
const connection = require('../config/connection');

module.exports = {

  getUserById: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM users WHERE user_id=?', id, (error, result) => {
      if (!error) {
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getUserByEmail: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM users WHERE email=?', id, (error, result) => {
      if (!error) {
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getUserProfileByNIK: (nik) => new Promise((resolve, reject) => {
    connection.query('SELECT users.*, kartu_keluarga.kepala_keluarga FROM users  INNER JOIN kartu_keluarga ON users.no_kk=kartu_keluarga.no_kk WHERE user_id=?', nik, (error, result) => {
      delete result[0].verif_akun;
      delete result[0].verif_email;
      delete result[0].kode_verifikasi_email;
      delete result[0].id_socket;
      delete result[0].password;
      delete result[0].created_at;
      delete result[0].updated_at;
      if (!error) {
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
  postUser: (setData) => new Promise((resolve, reject) => {
    connection.query('INSERT INTO users set ?', setData, (error, result) => {
      if (!error) {
        const newResult = {
          id: parseInt(setData.user_id),
          ...setData,
        };
        delete newResult.password;
        resolve(newResult);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getAllUsers: () => new Promise((resolve, reject) => {
    connection.query('SELECT users.*,kartu_keluarga.kepala_keluarga FROM users INNER JOIN kartu_keluarga ON kartu_keluarga.no_kk=users.no_kk', (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),

  putUser: (id_user, setData) => new Promise((resolve, reject) => {
    connection.query('UPDATE users set ? WHERE user_id=?', [setData, id_user], (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(id_user),
          ...result,
          field: { id: parseInt(id_user), ...setData },

        };
        delete newData.password;
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
  deleteUser: (id_user) => new Promise((resolve, reject) => {
    connection.query('DELETE from users WHERE user_id=?', id_user, (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(id_user),
          ...result,
        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getUsersCount: (id) => new Promise((resolve, reject) => {
    connection.query('select COUNT(users.user_id) as jumlah_users from users', id, (error, result) => {
      if (!error) {
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
};
