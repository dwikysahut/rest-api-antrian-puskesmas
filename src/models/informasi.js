/* eslint-disable radix */
/* eslint-disable camelcase */
const fs = require('fs');
const axios = require('axios');

const connection = require('../config/connection');

module.exports = {

  getInformasiById: (id) => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM informasi WHERE id_informasi=?', id, (error, result) => {
      if (!error) {
        console.log(result);
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
  postInformasi: (setData) => new Promise((resolve, reject) => {
    connection.query('INSERT INTO informasi set ?', setData, (error, result) => {
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
  getAllInformasi: () => new Promise((resolve, reject) => {
    connection.query('SELECT * FROM informasi', (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    });
  }),
  // instagramCodeGenerator:()=>
  getFromInstagram: (token) => new Promise((resolve, reject) => {
    console.log(token);
    try {
      axios
        .get(`https://graph.instagram.com/me/media?fields=id,media_type,media_url,caption,timestamp&access_token=${token}`, {
          headers: { 'Accept-Encoding': 'gzip,deflate,compress' },

        })
        .then((response) => {
          resolve(response.data.data);
        })
        .catch((error) => {
          console.log(error);

          if (error.response) { reject(new Error(error.response?.data?.error)); }
          reject(new Error('Network Error'));
        });
    } catch (error) {
      console.log(error);
    }
  }),
  putInformasi: (id_informasi, setData) => new Promise((resolve, reject) => {
    connection.query('UPDATE informasi set ? WHERE id_informasi=?', [setData, id_informasi], (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(id_informasi),
          ...result,
          field: { id: parseInt(id_informasi), ...setData },

        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
  deleteInformasi: (id_informasi) => new Promise((resolve, reject) => {
    connection.query('DELETE from informasi WHERE id_informasi=?', id_informasi, (error, result) => {
      if (!error) {
        const newData = {
          id: parseInt(id_informasi),
          ...result,
        };
        resolve(newData);
      } else {
        reject(new Error(error));
      }
    });
  }),
  deleteImage: (image) => new Promise((resolve, reject) => {
    fs.unlink(`./public/image/${image}`, (error) => {
      if (!error) {
        resolve(console.log('delete file Successfully'));
      } else {
        reject(new Error(error));
      }
    });
  }),
  getInformasiCount: (id) => new Promise((resolve, reject) => {
    connection.query('select COUNT(informasi.id_informasi) as jumlah_informasi from informasi', id, (error, result) => {
      if (!error) {
        resolve(result[0]);
      } else {
        reject(new Error(error));
      }
    });
  }),
};
