/* eslint-disable max-len */
const detailPraktekModel = require('../models/detailPraktek');
const helper = require('../helpers');

module.exports = {
  getAllDetailPraktek: async (request, response) => {
    try {
      const result = await detailPraktekModel.getAllDetailPraktek();
      return helper.response(response, 200, { message: 'Get All data Detail Praktek berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get All data Detail Praktek gagal' });
    }
  },
  getDetailPraktekById: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await detailPraktekModel.getDetailPraktekById(id);
      if (!result) {
        return helper.response(response, 404, { message: 'Data Detail Praktek tidak Ditemukan' });
      }
      return helper.response(response, 200, { message: 'Get data Detail Praktek berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get data Detail Praktek gagal' });
    }
  },
  getDetailPraktekByIdPraktek: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await detailPraktekModel.getDetailPraktekByIdPraktek(id);
      if (!result) {
        return helper.response(response, 404, { message: 'Data Detail Praktek tidak Ditemukan' });
      }
      return helper.response(response, 200, { message: 'Get data Detail Praktek berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get data Detail Praktek gagal' });
    }
  },

  postDetailPraktek: async (request, response) => {
    try {
      const setData = request.body;
      console.log(setData);
      const setDataDetailPraktek = {
        id_praktek: setData.id_praktek,
        id_dokter: setData.id_dokter,
        hari_praktek: setData.hari_praktek,
        jam_praktek: setData.jam_praktek,
        status_operasional: setData.status_operasional,

      };
      // const checkData = await detailPraktekModel.getDetailPraktekByIdDokterPraktek(setData.id_dokter, setData.id_praktek);
      //   if (checkData) {
      //     return helper.response(response, 409, { message: 'Data Dokter sudah ada' });
      //   }
      const result = await detailPraktekModel.postDetailPraktek(setDataDetailPraktek);
      return helper.response(response, 201, { message: 'Post data Detail Praktek berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Post data Detail Praktek gagal' });
    }
  },
  putDetailPraktek: async (request, response) => {
    try {
      const setData = request.body;
      const { id } = request.params;
      const setDataDetailPraktek = {
        id_praktek: setData.id_praktek,
        id_dokter: setData.id_dokter,
        hari_praktek: setData.hari_praktek,
        jam_praktek: setData.jam_praktek,
        status_operasional: setData.status_operasional,

      };
      const checkData = await detailPraktekModel.getDetailPraktekById(id);
      if (!checkData) {
        return helper.response(response, 404, { message: 'Data Detail Praktek tidak Ditemukan' });
      }
      const result = await detailPraktekModel.putDetailPraktek(id, setDataDetailPraktek);
      return helper.response(response, 200, { message: 'Put data Detail Praktek berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Put data Praktek gagal' });
    }
  },
  deleteDetailPraktek: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await detailPraktekModel.deleteDetailPraktek(id);
      return helper.response(response, 200, { message: 'Delete data  Detail Praktek berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Delete data Detail Praktek gagal' });
    }
  },
};
