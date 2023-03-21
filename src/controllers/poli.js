const helper = require('../helpers');
const poliModel = require('../models/poli');
const praktekModel = require('../models/praktek');

module.exports = {
  getAllPoli: async (request, response) => {
    try {
      const result = await poliModel.getAllPoli();
      helper.response(response, 200, { message: 'Get All Poli Berhasil' }, result);
    } catch (error) {
      console.log(error);
      helper.response(response, 500, { message: 'Get All Poli Gagal' });
    }
  },
  getPoliById: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await poliModel.getPoliById(id);
      if (!result) {
        return helper.response(response, 404, { message: 'Data Poli tidak Ditemukan' });
      }
      return helper.response(response, 200, { message: 'Get data Poli berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get data Poli gagal' });
    }
  },
  getPoliNotInPraktek: async (request, response) => {
    try {
      const id = request.params.id.toString() === 'null' ? '' : request.params.id;

      const result = await poliModel.getPoliNotInPraktek(id);

      return helper.response(response, 200, { message: 'Get data Poli berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Get data Poli gagal' });
    }
  },

  postPoli: async (request, response) => {
    try {
      const setData = request.body;
      setData.id_praktek = null;
      const setDataPoli = {
        id_praktek: null,
        nama_poli: setData.nama_poli,
        kode_poli: setData.kode_poli,
      };
      // console.log(setData);

      const result = await poliModel.postPoli(setDataPoli);
      return helper.response(response, 201, { message: 'Post data Poli berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Post data Poli gagal' });
    }
  },
  putPoli: async (request, response) => {
    try {
      const setData = request.body;
      const { id } = request.params;
      const setDataPoli = {
        nama_poli: setData.nama_poli,
        kode_poli: setData.kode_poli,
      };
      const checkData = await poliModel.getPoliById(id);
      if (!checkData) {
        return helper.response(response, 404, { message: 'Data Poli tidak Ditemukan' });
      }
      const result = await poliModel.putPoli(id, setDataPoli);
      return helper.response(response, 200, { message: 'Put data Poli berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Put data Poli gagal' });
    }
  },
  deletePoli: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await poliModel.deletePoli(id);
      return helper.response(response, 200, { message: 'Delete data Poli berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: `Delete data Poli gagal, ${error.message}` });
    }
  },
};
