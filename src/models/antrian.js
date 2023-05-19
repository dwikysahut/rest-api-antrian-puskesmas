/* eslint-disable radix */
/* eslint-disable camelcase */
const connection = require('../config/connection');

module.exports = {

  getAntrianById: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM view_antrian WHERE id_antrian=?', id, (error, result) => {
      if (!error) {
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),

  getAntrianByUserId: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM view_antrian WHERE user_id=? ORDER BY status_antrian = 6 OR status_antrian = 7 , urutan ASC', id, (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getAntrianByNoKK: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM view_antrian WHERE no_kk=? ORDER BY status_antrian = 6 OR status_antrian = 7 , urutan ASC', id, (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getAntrianByNik: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM view_antrian WHERE nik=?', id, (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getAntrianSequentialByDate: (tgl_periksa, id_praktek) => new Promise((resolve, reject) => {
    connection.query('SELECT max(urutan) as last_number FROM antrian WHERE tanggal_periksa=? AND id_praktek=?', [tgl_periksa, id_praktek], (error, result) => {
      if (!error) {
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getAntrianByDateAndPraktek: (tgl_periksa, id_praktek) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM antrian WHERE tanggal_periksa=? AND id_praktek=? ORDER BY urutan ASC', [tgl_periksa, id_praktek], (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getAntrianAvailableByDate: (tgl_periksa, id_praktek) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM antrian WHERE tanggal_periksa=? AND id_praktek=? AND antrian.status_antrian < \'6\' ORDER BY urutan ASC ', [tgl_periksa, id_praktek], (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getAntrianJustByDate: (tgl_periksa) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM antrian WHERE tanggal_periksa=? ORDER BY urutan ASC ', [tgl_periksa], (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  // main
  getAntrianAvailableByFilter: (query) => new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM view_antrian ${query}`, (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getNomorUrut: () => new Promise((resolve, reject) => {
    connection.query('SELECT MAX(urutan) as no_urut FROM view_antrian', (error, result) => {
      if (!error) {
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
  postAntrian: (setData) => new Promise((resolve, reject) => {
    connection.query('INSERT INTO antrian set ?', setData, (error, result) => {
      if (!error) {
        const newResult = {
          id: setData.id_antrian,
          ...setData,
        };
        delete newResult.password;
        resolve(newResult);
      } else {
        reject(new Error(error));
      }
    });
  }),

  getAllAntrian: () => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM view_antrian ORDER BY status_antrian = 6 OR status_antrian = 7 , urutan ASC', (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  putAntrian: (id_antrian, setData) => new Promise((resolve, reject) => {
    connection.query('UPDATE antrian set ? WHERE id_antrian=?', [setData, id_antrian], (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(id_antrian),
          ...result,
          field: { id: parseInt(id_antrian), ...setData },

        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
  deleteAntrian: (id_antrian) => new Promise((resolve, reject) => {
    connection.query('DELETE from detail_antrian WHERE id_antrian=?', id_antrian, (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(id_antrian),
          ...result,
        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getAntrianCount: (id) => new Promise((resolve, reject) => {
    connection.query('select COUNT(antrian.id_antrian) as jumlah_antrian from antrian', id, (error, result) => {
      if (!error) {
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
  getAntrianByMonth: () => new Promise((resolve, reject) => {
    connection.query('select COUNT(*) as jumlah_antrian, MONTH(created_at)+YEAR(created_at) as month_number, MONTHNAME(created_at) as month, YEAR(created_at) as year from antrian group by month_number,month order by month_number', (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),

};
