/* eslint-disable radix */
/* eslint-disable camelcase */
const connection = require('../config/connection');

module.exports = {

  getDetailAntrianById: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM view_detail_antrian WHERE id_detail_antrian=?', id, (error, result) => {
      if (!error) {
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getDetailAntrianByIdAntrianAndTahapPelayanan: (idAntrian, idTahapPelayanan) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM view_detail_antrian WHERE id_antrian=? AND id_tahap_pelayanan=?', [idAntrian, idTahapPelayanan], (error, result) => {
      if (!error) {
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),

  getDetailAntrianByIdAntrian: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM view_detail_antrian WHERE id_antrian=?', id, (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),

  //   getDetailAntrianByIdDokterPraktek: (id_dokter, id_praktek) => new Promise((resolve, reject) => {
  //     connection.query('SELECT * FROM view_detail_praktek WHERE id_dokter=? AND id_praktek=?', [id_dokter, id_praktek], (error, result) => {
  //       if (!error) {
  //         resolve(result[0]);
  //       } else {
  //         reject(new Error(error));
  //       }
  //     });
  //   }),
  postDetailAntrian: (setData) => new Promise((resolve, reject) => {
    connection.query('INSERT INTO detail_antrian set ?', setData, (error, result) => {
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
  getAllDetailAntrian: () => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM view_detail_antrian', (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  putDetailAntrian: (id_detail_antrian, setData) => new Promise((resolve, reject) => {
    // eslint-disable-next-line no-unused-vars
    connection.query('UPDATE detail_antrian set ? WHERE id_detail_antrian=?', [setData, id_detail_antrian], (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(id_detail_antrian),
          ...result,
          field: { id: parseInt(id_detail_antrian), ...setData },

        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
  deleteDetailAntrian: (id_detail_antrian) => new Promise((resolve, reject) => {
    connection.query('DELETE from detail_antrian WHERE id_detail_antrian=?', id_detail_antrian, (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(id_detail_antrian),
          ...result,
        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
};
