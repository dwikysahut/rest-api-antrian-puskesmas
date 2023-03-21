/* eslint-disable radix */
/* eslint-disable camelcase */
const connection = require('../config/connection');

module.exports = {

  getNotifikasiById: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM view_notifikasi WHERE id_notifikasi=?', id, (error, result) => {
      if (!error) {
        console.log(result);
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getNotifikasiByUser: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM view_notifikasi WHERE user_id=?', id, (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  postNotifikasi: (setData) => new Promise((resolve, reject) => {
    connection.query('INSERT INTO notifikasi set ?', setData, (error, result) => {
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
  getAllNotifikasi: () => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM view_notifikasi', (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),

  putNotifikasi: (id_notifikasi, setData) => new Promise((resolve, reject) => {
    connection.query('UPDATE notifikasi set ? WHERE id_notifikasi=?', [setData, id_notifikasi], (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(id_notifikasi),
          ...result,
          field: { id: parseInt(id_notifikasi), ...setData },

        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
  deleteNotifikasi: (id_notifikasi) => new Promise((resolve, reject) => {
    connection.query('DELETE from notifikasi WHERE id_notifikasi=?', id_notifikasi, (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(id_notifikasi),
          ...result,
        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
};
