/* eslint-disable radix */
/* eslint-disable camelcase */
const connection = require('../config/connection');

module.exports = {

  getPraktekById: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM view_praktek WHERE id_praktek=?', id, (error, result) => {
      if (!error) {
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getPoliFromPraktek: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM view_praktek WHERE id_poli=?', id, (error, result) => {
      if (!error) {
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
  postPraktek: (setData) => new Promise((resolve, reject) => {
    connection.query('INSERT INTO praktek set ?', setData, (error, result) => {
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
  getAllPraktek: () => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM view_praktek', (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  putPraktek: (id_praktek, setData) => new Promise((resolve, reject) => {
    // eslint-disable-next-line no-unused-vars
    connection.query('UPDATE praktek set ? WHERE id_praktek=?', [setData, id_praktek], (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(id_praktek),
          ...result,
          field: { id: parseInt(id_praktek), ...setData },

        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
  deletePraktek: (id_praktek) => new Promise((resolve, reject) => {
    connection.query('DELETE from praktek WHERE id_praktek=?', id_praktek, (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(id_praktek),
          ...result,
        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),

};
