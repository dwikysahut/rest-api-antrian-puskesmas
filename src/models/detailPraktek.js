/* eslint-disable radix */
/* eslint-disable camelcase */
const connection = require('../config/connection');

module.exports = {

  getDetailPraktekById: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM view_detail_praktek WHERE id_detail_praktek=?', id, (error, result) => {
      if (!error) {
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getDetailPraktekByIdPraktek: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM view_detail_praktek WHERE id_praktek=?', id, (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getDetailPraktekByIdDokterPraktek: (id_dokter, id_praktek) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM view_detail_praktek WHERE id_dokter=? AND id_praktek=?', [id_dokter, id_praktek], (error, result) => {
      if (!error) {
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
  postDetailPraktek: (setData) => new Promise((resolve, reject) => {
    connection.query('INSERT INTO detail_praktek set ?', setData, (error, result) => {
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
  getAllDetailPraktek: () => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM view_detail_praktek', (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  putDetailPraktek: (id_detail_praktek, setData) => new Promise((resolve, reject) => {
    // eslint-disable-next-line no-unused-vars
    connection.query('UPDATE detail_praktek set ? WHERE id_detail_praktek=?', [setData, id_detail_praktek], (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(id_detail_praktek),
          ...result,
          field: { id: parseInt(id_detail_praktek), ...setData },

        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
  deleteDetailPraktek: (id_detail_praktek) => new Promise((resolve, reject) => {
    connection.query('DELETE from detail_praktek WHERE id_detail_praktek=?', id_detail_praktek, (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(id_detail_praktek),
          ...result,
        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
};
