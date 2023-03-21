/* eslint-disable max-len */
const detailRekamMedisModel = require('../models/detailRekamMedis');
const kartuKeluargaModel = require('../models/kartuKeluarga');
const helper = require('../helpers');

module.exports = {
  getAllDetailRekamMedis: async (request, response) => {
    try {
      const result = await detailRekamMedisModel.getAllDetailRekamMedis();
      return helper.response(response, 200, { message: 'Get All data Detail Rekam Medis berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get All data Detail Rekam Medis gagal' });
    }
  },
  getAllDetailRekamMedisByNoRM: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await detailRekamMedisModel.getAllDetailRekamMedisByNoRM(id);
      return helper.response(response, 200, { message: 'Get All data Detail Rekam Medis berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get All data Detail Rekam Medis gagal' });
    }
  },

  postDetailRekamMedis: async (request, response) => {
    try {
      const setData = request.body;
      const setDataDetailRM = {
        no_rm: setData.no_rm,
        nik: setData.nik,
        id_rak: setData.id_rak,
      };
      const checkData = await detailRekamMedisModel.getDetailRekamMedisByNIK(setDataDetailRM.nik);
      if (checkData) {
        return helper.response(response, 409, { message: 'NIK Sudah tercatat dalam Detail Rekam Medis' });
      }

      const result = await detailRekamMedisModel.postDetailRekamMedis(setDataDetailRM);
      return helper.response(response, 201, { message: 'Post data Detail Rekam Medis berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Post data Detail Rekam Medis gagal' });
    }
  },
  putDetailRekamMedis: async (request, response) => {
    try {
      const setData = request.body;
      const { id } = request.params;
      const setDataDetailRM = {
        no_rm: setData.no_rm,
        nik: setData.nik,
        id_rak: setData.id_rak,
      };
      const checkData = await detailRekamMedisModel.getDetailRekamMedisById(id);
      if (!checkData) {
        return helper.response(response, 404, { message: 'Data Detail Rekam Medis tidak Ditemukan' });
      }
      const result = await detailRekamMedisModel.putDetailRekamMedis(id, setDataDetailRM);

      return helper.response(response, 200, { message: 'Put data Detail Rekam Medis berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Put data Detail Rekam Medis gagal' });
    }
  },
  deleteDetailRekamMedis: async (request, response) => {
    try {
      const { id } = request.params;
      const checkData = await detailRekamMedisModel.getDetailRekamMedisById(id);
      if (!checkData) {
        return helper.response(response, 404, { message: 'Data Detail Rekam Medis tidak Ditemukan' });
      }
      const result = await detailRekamMedisModel.deleteDetailRekamMedis(id);
      return helper.response(response, 200, { message: 'Delete data Detail Rekam Medis berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: `Delete data Detail Rekam Medis gagal, ${error.message}` });
    }
  },
};
