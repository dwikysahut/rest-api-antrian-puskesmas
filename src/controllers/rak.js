/* eslint-disable max-len */
const rakModel = require('../models/Rak');
const helper = require('../helpers');

module.exports = {
  getAllRak: async (request, response) => {
    try {
      const result = await rakModel.getAllRak();
      return helper.response(response, 200, { message: 'Get All data Rak berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get All data Rak gagal' });
    }
  },
  getRakById: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await rakModel.getRakById(id);
      if (!result) {
        return helper.response(response, 404, { message: 'Data Rak tidak Ditemukan' });
      }
      return helper.response(response, 200, { message: 'Get data Rak berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get data Rak gagal' });
    }
  },

  postRak: async (request, response) => {
    try {
      const setData = request.body;
      console.log(setData);

      const result = await rakModel.postRak(setData);
      return helper.response(response, 201, { message: 'Post data Rak berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Post data Rak gagal' });
    }
  },
  putRak: async (request, response) => {
    try {
      const setData = request.body;
      const { id } = request.params;
      const checkData = await rakModel.getRakById(id);
      if (!checkData) {
        return helper.response(response, 404, { message: 'Data Rak tidak Ditemukan' });
      }
      const result = await rakModel.putRak(id, setData);
      return helper.response(response, 200, { message: 'Put data Rak berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Put data Rak gagal' });
    }
  },
  deleteRak: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await rakModel.deleteRak(id);
      return helper.response(response, 200, { message: 'Delete data Rak berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Delete data Rak gagal' });
    }
  },
};
