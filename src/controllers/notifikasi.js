/* eslint-disable max-len */
/* eslint-disable radix */
const helper = require('../helpers');
const notifikasiModel = require('../models/notifikasi');
const userModel = require('../models/users');
// const userModel = require('../models/antrian');

module.exports = {
  getAllNotifikasi: async (request, response) => {
    try {
      const result = await notifikasiModel.getAllNotifikasi();
      helper.response(response, 200, { message: 'Get All Notifikasi  Berhasil' }, result);
    } catch (error) {
      console.log(error);
      helper.response(response, 500, { message: 'Get All Notifikasi  Gagal' });
    }
  },
  getNotifikasiById: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await notifikasiModel.getNotifikasiById(id);
      if (!result) {
        return helper.response(response, 404, { message: 'Data Notifikasi  tidak Ditemukan' });
      }
      return helper.response(response, 200, { message: 'Get data Notifikasi  berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get data Notifikasi  gagal' });
    }
  },
  getNotifikasiByUser: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await notifikasiModel.getNotifikasiByUser(id);

      return helper.response(response, 200, { message: 'Get data Notifikasi dari User berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Get data Notifikasi  gagal' });
    }
  },

  postNotifikasi: async (request, response) => {
    try {
      const setData = request.body;
      console.log(setData);
      if (parseInt(setData.jenis_notifikasi) === 1) {
        const checkUser = await userModel.getUserById(setData.nik_tujuan);
        if (!checkUser) {
          return helper.response(response, 404, { message: 'User dengan id tersebut tidak ditemukan' }, result);
        }
        // const checkAntrian = await antrianModel.getAntrianById(setData.id_antrian_tujuan);
        // if (!checkAntrian) {
        //   return helper.response(response, 404, { message: 'Antrian dengan id tersebut tidak ditemukan' }, result);
        // }
      }
      setData.is_opened = 0;

      const result = await notifikasiModel.postNotifikasi(setData);
      return helper.response(response, 201, { message: 'Post data Notifikasi  berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Post data Notifikasi  gagal' });
    }
  },
  putNotifikasi: async (request, response) => {
    try {
      const setData = request.body;
      const { id } = request.params;
      const checkData = await notifikasiModel.getNotifikasiById(id);
      if (!checkData) {
        return helper.response(response, 404, { message: 'Data Notifikasi  tidak Ditemukan' });
      }
      const result = await notifikasiModel.putNotifikasi(id, setData);
      return helper.response(response, 200, { message: 'Put data Notifikasi  berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Put data Notifikasi  gagal' });
    }
  },
  deleteNotifikasi: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await notifikasiModel.deleteNotifikasi(id);
      return helper.response(response, 200, { message: 'Delete data Notifikasi  berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: `Delete data Notifikasi  gagal, ${error.message}` });
    }
  },
};
