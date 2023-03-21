/* eslint-disable max-len */
/* eslint-disable camelcase */
const kartuKeluargaModel = require('../models/kartuKeluarga');
const rekamMedisModel = require('../models/rekamMedis');
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
      const checkDataKK = await kartuKeluargaModel.getnoKKByID(setData.no_kk);
      if (checkDataKK) {
        return helper.response(response, 409, { message: 'No KK sudah terdaftar' });
      }
      const checkDataRM = await rekamMedisModel.getRekamMedisById(setData.no_rm);
      const result = await kartuKeluargaModel.postKartuKeluarga(
        {
          no_kk: setData.no_kk,
          kepala_keluarga: setData.kepala_keluarga,
        },
      );
      if (checkDataRM) {
        if (checkDataRM.no_kk !== setData.no_kk) {
          await kartuKeluargaModel.putKartuKeluarga(checkDataRM.no_kk, { no_rm: null });

          await rekamMedisModel.putRekamMedis(setData.no_rm, { no_kk: setData.no_kk });
        }
        // await kartuKeluargaModel.putKartuKeluarga(checkDataRM.no_kk, { no_rm: setData.no_rm });
      } else if (!checkDataRM) {
        await rekamMedisModel.postRekamMedis({ no_rm: setData.no_rm, no_kk: setData.no_kk });
      }
      await kartuKeluargaModel.putKartuKeluarga(setData.no_kk, { no_rm: setData.no_rm });

      return helper.response(response, 201, { message: 'Post data Kartu Keluarga berhasil' }, result);
    } catch (error) {
      console.log(error);
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
      const checkDataRM = await rekamMedisModel.getRekamMedisById(setData.no_rm);

      if (checkDataRM) {
        if (checkDataRM.no_kk !== id) {
          await kartuKeluargaModel.putKartuKeluarga(id, { no_rm: null });
          await rekamMedisModel.putRekamMedis(setData.no_rm, { no_kk: id });
        }
      } else if (!checkDataRM) {
        await rekamMedisModel.postRekamMedis({ no_rm: setData.no_rm, no_kk: id });
      }
      const result = await kartuKeluargaModel.putKartuKeluarga(id, setData);
      if (setData.no_rm) {
        await rekamMedisModel.putRekamMedis(
          setData.no_rm,
          { no_kk: id },
        );
      }

      return helper.response(response, 200, { message: 'Put data Kartu Keluarga berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Put data Kartu Keluarga gagal' });
    }
  },
  deleteKartuKeluarga: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await kartuKeluargaModel.deleteKartuKeluarga(id);

      // const checkData = await kartuKeluargaModel.getnoKKByID(id);
      // if (checkData) {
      //   const jumlah = await rekamMedisModel.getCountRekamMedisById(checkData.no_rm);
      //   // console.log(jumlah);
      //   await rekamMedisModel.putRekamMedis(
      //     checkData.no_rm,
      //     { jumlah_anggota_keluarga: jumlah.jumlah_anggota },
      //   );
      // }
      return helper.response(response, 200, { message: 'Delete data Kartu Keluarga berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Delete data Kartu Keluarga gagal' });
    }
  },
};
