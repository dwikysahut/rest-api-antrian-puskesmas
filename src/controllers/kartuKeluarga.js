const kartuKeluargaModel = require('../models/kartuKeluarga');
const helper = require('../helpers');

module.exports = {
  getAllKartuKeluarga: async (request, response) => {
    try {
      const result = await kartuKeluargaModel.getAllKartuKeluarga();
      return helper.response(response, 200, { message: 'Get All data Kartu Keluarga berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get All data Kartu Keluarga gagal' });
    }
  },
  getnoKKByID: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await kartuKeluargaModel.getnoKKByID(id);
      if (!result) {
        return helper.response(response, 404, { message: 'Data Kartu Keluarga tidak Ditemukan' });
      }
      return helper.response(response, 200, { message: 'Get data Kartu Keluarga berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get data Kartu Keluarga gagal' });
    }
  },

  postKartuKeluarga: async (request, response) => {
    try {
      const setData = request.body;
      const checkData = await kartuKeluargaModel.getnoKKByID(setData.no_kk);
      if (checkData) {
        return helper.response(response, 409, { message: 'No KK sudah digunakan' });
      }

      const result = await kartuKeluargaModel.postKartuKeluarga(setData);
      return helper.response(response, 201, { message: 'Post data Kartu Keluarga berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Post data Kartu Keluarga gagal' });
    }
  },
  putKartuKeluarga: async (request, response) => {
    try {
      const setData = request.body;
      const { id } = request.params;
      const checkData = await kartuKeluargaModel.getnoKKByID(id);
      if (!checkData) {
        return helper.response(response, 404, { message: 'Data Kartu Keluarga tidak Ditemukan' });
      }
      const result = await kartuKeluargaModel.putKartuKeluarga(id, setData);
      return helper.response(response, 200, { message: 'Put data Kartu Keluarga berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Put data Kartu Keluarga gagal' });
    }
  },
  deleteKartuKeluarga: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await kartuKeluargaModel.deleteKartuKeluarga(id);
      return helper.response(response, 200, { message: 'Delete data Kartu Keluarga berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Delete data Kartu Keluarga gagal' });
    }
  },
};
