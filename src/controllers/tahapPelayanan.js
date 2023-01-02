/* eslint-disable max-len */
const tahapPelayananModel = require('../models/tahapPelayanan');
const helper = require('../helpers');

module.exports = {
  getAllTahapPelayanan: async (request, response) => {
    try {
      const result = await tahapPelayananModel.getAllTahapPelayanan();
      return helper.response(response, 200, { message: 'Get All data Tahap Pelayanan berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get All data Tahap Pelayanan gagal' });
    }
  },
  getTahapPelayananById: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await tahapPelayananModel.getTahapPelayananById(id);
      if (!result) {
        return helper.response(response, 404, { message: 'Data Tahap Pelayanan tidak Ditemukan' });
      }
      return helper.response(response, 200, { message: 'Get data Tahap Pelayanan berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get data Tahap Pelayanan gagal' });
    }
  },

  postTahapPelayanan: async (request, response) => {
    try {
      const setData = request.body;
      console.log(setData);

      const result = await tahapPelayananModel.postTahapPelayanan(setData);
      return helper.response(response, 201, { message: 'Post data Tahap Pelayanan berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Post data Tahap Pelayanan gagal' });
    }
  },
  putTahapPelayanan: async (request, response) => {
    try {
      const setData = request.body;
      const { id } = request.params;
      const checkData = await tahapPelayananModel.getTahapPelayananById(id);
      if (!checkData) {
        return helper.response(response, 404, { message: 'Data Tahap Pelayanan tidak Ditemukan' });
      }
      const result = await tahapPelayananModel.putTahapPelayanan(id, setData);
      return helper.response(response, 200, { message: 'Put data Tahap Pelayanan berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Put data Tahap Pelayanan gagal' });
    }
  },
  deleteTahapPelayanan: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await tahapPelayananModel.deleteTahapPelayanan(id);
      return helper.response(response, 200, { message: 'Delete data Tahap Pelayanan berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Delete data Tahap Pelayanan gagal' });
    }
  },
};
