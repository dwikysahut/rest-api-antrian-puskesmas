const dokterModel = require('../models/dokter');
const helper = require('../helpers');

module.exports = {
  getAllDokter: async (request, response) => {
    try {
      const result = await dokterModel.getAllDokter();
      return helper.response(response, 200, { message: 'Get All data Dokter berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get All data Dokter gagal' });
    }
  },
  getDokterById: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await dokterModel.getDokterById(id);
      if (!result) {
        return helper.response(response, 404, { message: 'Data Dokter tidak Ditemukan' });
      }
      return helper.response(response, 200, { message: 'Get data Dokter berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Put data Dokter gagal' });
    }
  },

  postDokter: async (request, response) => {
    try {
      const setData = request.body;
      const checkData = await dokterModel.getDokterById(setData.id_dokter);
      if (checkData) {
        return helper.response(response, 409, { message: 'ID Dokter sudah digunakan' });
      }

      const result = await dokterModel.postDokter(setData);
      return helper.response(response, 201, { message: 'Post data Dokter berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Post data Dokter gagal' });
    }
  },
  putDokter: async (request, response) => {
    try {
      const setData = request.body;
      const { id } = request.params;
      const checkData = await dokterModel.getDokterById(id);
      if (!checkData) {
        return helper.response(response, 404, { message: 'Data Dokter tidak Ditemukan' });
      }
      const result = await dokterModel.putDokter(id, setData);
      return helper.response(response, 200, { message: 'Put data Dokter berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Put data Dokter gagal' });
    }
  },
  deleteDokter: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await dokterModel.deleteDokter(id);
      return helper.response(response, 200, { message: 'Delete data Dokter berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Delete data Dokter gagal' });
    }
  },
};
