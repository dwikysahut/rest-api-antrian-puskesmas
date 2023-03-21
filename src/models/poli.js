/* eslint-disable radix */
/* eslint-disable camelcase */
const connection = require('../config/connection');

module.exports = {

  getPoliById: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM poli WHERE id_poli=?', id, (error, result) => {
      if (!error) {
        console.log(result);
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getPoliNotInPraktek: (id) => new Promise((resolve, reject) => {
    console.log(id);
    connection.query('SELECT * FROM poli WHERE poli.id_poli NOT IN (SELECT praktek.id_poli FROM praktek) OR poli.id_poli=?', id, (error, result) => {
      if (!error) {
        console.log(result);
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  postPoli: (setData) => new Promise((resolve, reject) => {
    connection.query('INSERT INTO poli set ?', setData, (error, result) => {
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
  getAllPoli: () => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM poli', (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),

  putPoli: (id_poli, setData) => new Promise((resolve, reject) => {
    connection.query('UPDATE poli set ? WHERE id_poli=?', [setData, id_poli], (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(id_poli),
          ...result,
          field: { id: parseInt(id_poli), ...setData },

        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
  deletePoli: (id_poli) => new Promise((resolve, reject) => {
    connection.query('DELETE from poli WHERE id_poli=?', id_poli, (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(id_poli),
          ...result,
        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getPoliCount: (id) => new Promise((resolve, reject) => {
    connection.query('select COUNT(poli.id_poli) as jumlah_poli from poli', id, (error, result) => {
      if (!error) {
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
};
