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
    connection.query('SELECT * FROM users', (error, result) => {
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
          ...setData,
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
};
