/* eslint-disable max-len */
const rekamMedisModel = require('../models/rekamMedis');
const kartuKeluargaModel = require('../models/kartuKeluarga');
const helper = require('../helpers');

module.exports = {
  getAllRekamMedis: async (request, response) => {
    try {
      const result = await rekamMedisModel.getAllRekamMedis();
      return helper.response(response, 200, { message: 'Get All data Rekam Medis berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get All data Rekam Medis gagal' });
    }
  },
  getRekamMedisById: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await rekamMedisModel.getRekamMedisById(id);
      if (!result) {
        return helper.response(response, 404, { message: 'Data Rekam Medis tidak Ditemukan' });
      }
      return helper.response(response, 200, { message: 'Get data Rekam Medis berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get data Rekam Medis gagal' });
    }
  },

  postRekamMedis: async (request, response) => {
    try {
      const setData = request.body;
      console.log(setData);

      const result = await rekamMedisModel.postRekamMedis(setData);
      await kartuKeluargaModel.putKartuKeluarga(setData.no_kk, { no_rm: setData.no_rm });
      return helper.response(response, 201, { message: 'Post data Rekam Medis berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Post data Rekam Medis gagal' });
    }
  },
  putRekamMedis: async (request, response) => {
    try {
      const setData = request.body;
      const { id } = request.params;
      const checkData = await rekamMedisModel.getRekamMedisById(id);
      if (!checkData) {
        return helper.response(response, 404, { message: 'Data Rekam Medis tidak Ditemukan' });
      }
      const result = await rekamMedisModel.putRekamMedis(id, setData);
      return helper.response(response, 200, { message: 'Put data Rekam Medis berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Put data Rekam Medis gagal' });
    }
  },
  deleteRekamMedis: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await rekamMedisModel.deleteRekamMedis(id);
      return helper.response(response, 200, { message: 'Delete data Rekam Medis berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Delete data Rekam Medis gagal' });
    }
  },
};
