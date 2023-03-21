/* eslint-disable max-len */
const detailAntrianModel = require('../models/detailAntrian');
const helper = require('../helpers');

module.exports = {
  getAllDetailAntrian: async (request, response) => {
    try {
      const result = await detailAntrianModel.getAllDetailAntrian();
      return helper.response(response, 200, { message: 'Get All data Detail Antrian berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get All data Detail Antrian gagal' });
    }
  },
  getDetailAntrianById: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await detailAntrianModel.getDetailAntrianById(id);
      if (!result) {
        return helper.response(response, 404, { message: 'Data Detail Antrian tidak Ditemukan' });
      }
      return helper.response(response, 200, { message: 'Get data Detail Antrian berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get data Detail Antrian gagal' });
    }
  },
  getDetailAntrianByIdAntrian: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await detailAntrianModel.getDetailAntrianByIdAntrian(id);
      if (!result) {
        return helper.response(response, 404, { message: 'Data Detail Antrian tidak Ditemukan' });
      }
      return helper.response(response, 200, { message: 'Get data Detail Antrian berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get data Detail Antrian gagal' });
    }
  },

  postDetailAntrian: async (request, response) => {
    try {
      const setData = request.body;
      console.log(setData);

      const result = await detailAntrianModel.postDetailAntrian(setData);
      return helper.response(response, 201, { message: 'Post data Detail Antrian berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Post data Detail Antrian gagal' });
    }
  },
  putDetailAntrian: async (request, response) => {
    try {
      const setData = request.body;
      const { id } = request.params;
      const checkData = await detailAntrianModel.getDetailAntrianById(id);
      if (!checkData) {
        return helper.response(response, 404, { message: 'Data Detail Antrian tidak Ditemukan' });
      }
      const result = await detailAntrianModel.putDetailAntrian(id, setData);
      return helper.response(response, 200, { message: 'Put data Detail Antrian berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Put data Antrian gagal' });
    }
  },
  deleteDetailAntrian: async (request, response) => {
    try {
      const { id } = request.params;

      const result = await detailAntrianModel.deleteDetailAntrian(id);
      return helper.response(response, 200, { message: 'Delete data  Detail Antrian berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Delete data Detail Antrian gagal' });
    }
  },
};
