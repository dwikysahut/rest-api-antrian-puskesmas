/* eslint-disable max-len */
const praktekModel = require('../models/praktek');
const poliModel = require('../models/poli');
const helper = require('../helpers');

module.exports = {
  getAllPraktek: async (request, response) => {
    try {
      const result = await praktekModel.getAllPraktek();
      return helper.response(response, 200, { message: 'Get All data Praktek berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get All data Praktek gagal' });
    }
  },
  getPraktekById: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await praktekModel.getPraktekById(id);
      if (!result) {
        return helper.response(response, 404, { message: 'Data Praktek tidak Ditemukan' });
      }
      return helper.response(response, 200, { message: 'Get data Praktek berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get data Praktek gagal' });
    }
  },

  postPraktek: async (request, response) => {
    try {
      const setData = request.body;
      const setDataPraktek = {
        id_poli: setData.id_poli,
        status_operasional: setData.status_operasional,
        total_dokter: 0,
        waktu_pelayanan: setData.waktu_pelayanan ? setData.waktu_pelayanan : 10,
        kuota_booking: setData.kuota_booking,
        dokter_tersedia: 0,
        jumlah_pelayanan: setData.jumlah_pelayanan,

      };
      const checkPoli = await praktekModel.getPoliFromPraktek(setDataPraktek.id_poli);
      console.log(checkPoli);
      if (checkPoli) {
        return helper.response(response, 409, { message: 'Data Poli telah tercatat pada tabel praktek' });
      }
      const result = await praktekModel.postPraktek(setDataPraktek);
      await poliModel.putPoli(setDataPraktek.id_poli, { id_praktek: result.id });

      return helper.response(response, 201, { message: 'Post data Praktek berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Post data Praktek gagal' });
    }
  },
  putPraktek: async (request, response) => {
    try {
      const setData = request.body;
      const { id } = request.params;
      const setDataPraktek = {
        id_poli: setData.id_poli,
        status_operasional: setData.status_operasional,
        waktu_pelayanan: setData.waktu_pelayanan ? setData.waktu_pelayanan : 10,
        kuota_booking: setData.kuota_booking,

      };
      const checkData = await praktekModel.getPraktekById(id);
      if (!checkData) {
        return helper.response(response, 404, { message: 'Data Praktek tidak Ditemukan' });
      }

      const result = await praktekModel.putPraktek(id, setDataPraktek);
      await poliModel.putPoli(setDataPraktek.id_poli, { id_praktek: id });

      return helper.response(response, 200, { message: 'Put data Praktek berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Put data Praktek gagal' });
    }
  },
  deletePraktek: async (request, response) => {
    try {
      const { id } = request.params;
      const getPraktekById = await praktekModel.getPraktekById(id);
      const result = await praktekModel.deletePraktek(id);
      await poliModel.putPoli(getPraktekById.id_poli, { id_praktek: null });
      return helper.response(response, 200, { message: 'Delete data Praktek berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Delete data Praktek gagal' });
    }
  },
};
