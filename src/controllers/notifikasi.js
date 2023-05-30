/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
/* eslint-disable radix */
const helper = require('../helpers');
const notifikasiModel = require('../models/notifikasi');
const userModel = require('../models/users');
const antrianModel = require('../models/antrian');
const praktekModel = require('../models/praktek');
// const userModel = require('../models/antrian');
const NotificationServiceInstance = require('../utils/NotificationService');
const fcmUsers = require('../utils/array-fcm');
const connection = require('../config/connection');

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
      const resultNotifikasi = await notifikasiModel.getNotifikasiByUser(id);
      // mengambil notifikasi request dari user_id_tujuan adalah user yang bersangkutan
      const resultRequest = await notifikasiModel.getNotifikasiRequestByUser(id);
      const result = [...resultNotifikasi, ...resultRequest];

      return helper.response(response, 200, { message: 'Get data Notifikasi dari User berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Get data Notifikasi  gagal' });
    }
  },
  postReverseRequest: async (request, response) => {
    await connection.beginTransaction();
    try {
      const setData = request.body;
      const { io } = request;

      // cek apakah user pernah mengirimkan permintaan yang sama
      const checkDataNotifikasi = await notifikasiModel.getNotifikasiByAntrian(setData.id_antrian, setData.id_antrian_tujuan);
      if (checkDataNotifikasi) {
        console.log('errror');
        await connection.rollback();

        return helper.response(response, 404, { message: 'Pengajuan gagal, anda sudah pernah mengajukan ke nomor antrian tersebut' });
      }

      // post notif user berisi id antrian dan id antrian tujuan
      const setDataNotif = {
        id_antrian: setData.id_antrian,
        text_notifikasi: setData.alasan,
        jenis_notifikasi: 2,
        aksi: 0,
        id_antrian_tujuan: setData.id_antrian_tujuan,
        is_opened: '0',
      };
      const result = await notifikasiModel.postNotifikasi(setDataNotif);
      // TIDAK JADI
      // post notif ke user yang akan menukar
      // const setDataNotifAsal = {
      //   id_antrian: setData.id_antrian,
      //   text_notifikasi: setData.alasan,
      //   jenis_notifikasi: 2,
      //   aksi: 0,
      //   id_antrian_tujuan: setData.id_antrian_tujuan,
      //   is_opened: '0',
      // };
      // const result = await notifikasiModel.postNotifikasi(setDataNotifAsal);

      const checkData = await antrianModel.getAntrianById(setDataNotif.id_antrian_tujuan);
      const checkDataAsal = await antrianModel.getAntrianById(setDataNotif.id_antrian);

      // edit request_tukar penukar (pengirim )
      await antrianModel.putAntrian(setData.id_antrian, { request_tukar: 0 });
      await connection.commit();

      // trigger event melalui socket
      io.emit('server-postRequest', {
        user_id_asal: checkDataAsal.user_id, user_id_tujuan: checkData.user_id, tanggal_periksa: helper.getFullDate(new Date(checkDataAsal.tanggal_periksa)), id_praktek: checkDataAsal.id_praktek,
      });
      const tokens = fcmUsers.filter((item) => item.userId.split('--')[0] == checkData.user_id_tujuan).map((item) => item.token);
      if (tokens.length > 0) {
        await NotificationServiceInstance.publishNotification('Permintaan Penukaran antrian baru', 'Seorang pasien ingin menukarkan antrian dengan anda ', tokens);
      }

      return helper.response(response, 201, { message: 'Post data Request Notifikasi  berhasil' }, result);
    } catch (error) {
      console.log(error);
      await connection.rollback();
      return helper.response(response, 500, { message: 'Post data Request Notifikasi  gagal' });
    }
  },
  putActionReverseRequest: async (request, response) => {
    await connection.beginTransaction();
    try {
      const setData = request.body;
      const { id } = request.params;
      const { io } = request;

      const checkDataTujuan = await notifikasiModel.getNotifikasiById(id);
      if (!checkDataTujuan) {
        await connection.rollback();

        return helper.response(response, 404, { message: 'Data Notifikasi tidak ditemukan' }, {});
      }

      // saat di terima untuk request pertukaran
      if (setData.aksi == 1) {
        // post notif baru ke user penerima (yang melakukan aksi)
        const setDataNotifTujuan = {
          id_antrian: checkDataTujuan.id_antrian_tujuan,
          text_notifikasi: 'Pengajuan pertukaran antrian',
          jenis_notifikasi: 2,
          aksi: setData.aksi,
          id_antrian_tujuan: checkDataTujuan.id_antrian,
          is_opened: '0',
        };
        await notifikasiModel.postNotifikasi(setDataNotifTujuan);

        // ubah text dan aksi notifikasi
        const setDataNotifAsal = {
          text_notifikasi: 'Pengajuan Pertukaran antrian',

          aksi: setData.aksi,
        };

        // put notif ke user asal yang mengajukan  pertukaran
        const result = await notifikasiModel.putNotifikasi(checkDataTujuan.id_notifikasi, setDataNotifAsal);
        const tokens = fcmUsers.filter((item) => item.userId.split('--')[0] == checkDataTujuan.user_id).map((item) => item.token);
        if (tokens.length > 0) { await NotificationServiceInstance.publishNotification('Status Permintaan Penukaran antrian ', 'Permintaan Penukaran anda "DITERIMA" ', tokens); }

        //  request_tukar penukar tetap 0
        ///---------------------

        // semua request yang masuk ke user dengan nomor antrian yang sama akan di tolak otomatis
        const check = await notifikasiModel.getNotifikasiRequestByUserWithSameIdAntrian(checkDataTujuan.user_id_tujuan, checkDataTujuan.id_antrian_tujuan);
        console.log(check);
        if (check.length > 0) {
          for (let i = 0; i < check.length; i++) {
            const setDataNotif = {
              text_notifikasi: 'Pengajuan Pertukaran antrian',
              aksi: 2,
            };
            // ubah status notif dibatalkan dan text notifikasi menjadi pemberitahuan
            await notifikasiModel.putNotifikasi(check[i].id_notifikasi, setDataNotif);

            //  request_tukar penukar kembali menjadi 1
            await antrianModel.putAntrian(check[i].id_antrian, { request_tukar: 1 });
          }
          const tokenList = fcmUsers.filter((item) => check.some((itemCompare) => item.userId.split('--')[0] == itemCompare.user_id)).map((item) => item.token);
          if (tokenList.length > 0) {
            await NotificationServiceInstance.publishNotification('Status Permintaan Penukaran antrian ', 'Permintaan Penukaran anda "DITERIMA" ', tokenList);
          }
        }
        // tukar antrian
        const antrianAsal = await antrianModel.getAntrianById(checkDataTujuan.id_antrian);
        const antrianTujuan = await antrianModel.getAntrianById(checkDataTujuan.id_antrian_tujuan);
        await antrianModel.putAntrian(antrianAsal.id_antrian, {
          urutan: antrianTujuan.urutan,
          // nomor_antrian: antrianTujuan.nomor_antrian,
          waktu_pelayanan: antrianTujuan.waktu_pelayanan,
          estimasi_waktu_pelayanan: antrianTujuan.estimasi_waktu_pelayanan,
        });
        await antrianModel.putAntrian(antrianTujuan.id_antrian, {
          urutan: antrianAsal.urutan,
          // nomor_antrian: antrianAsal.nomor_antrian,
          waktu_pelayanan: antrianAsal.waktu_pelayanan,
          estimasi_waktu_pelayanan: antrianAsal.estimasi_waktu_pelayanan,
        });

        await connection.commit();
        io.emit('server-putRequest', {
          user_id_asal: antrianAsal.user_id, user_id_tujuan: antrianTujuan.user_id, tanggal_periksa: helper.getFullDate(new Date(antrianAsal.tanggal_periksa)), id_praktek: antrianAsal.id_praktek,
        });
        return helper.response(response, 200, { message: 'put data Request Notifikasi  berhasil' }, result);
      }
      //
      //
      // =====================saat ditolak atau aksi = 2=========================
      const setDataNotifTujuan = {
        text_notifikasi: 'Pengajuan Pertukaran antrian',
        aksi: setData.aksi,
      };

      await notifikasiModel.putNotifikasi(id, setDataNotifTujuan);

      // post notif ke user asal yang mengajukan  pertukaran

      const setDataNotifAsal = {
        id_antrian: checkDataTujuan.id_antrian_tujuan,
        text_notifikasi: 'Pengajuan pertukaran antrian',
        jenis_notifikasi: 2,
        aksi: setData.aksi,
        id_antrian_tujuan: checkDataTujuan.id_antrian,
        is_opened: '0',
      };
      const result = await notifikasiModel.postNotifikasi(setDataNotifAsal);
      const tokens = fcmUsers.filter((item) => item.userId.split('--')[0] == checkDataTujuan.user_id).map((item) => item.token);
      if (tokens.length > 0) {
        await NotificationServiceInstance.publishNotification('Status Permintaan Penukaran antrian ', 'Permintaan Penukaran anda "DITOLAK" ', tokens);
      }

      const antrianAsal = await antrianModel.getAntrianById(checkDataTujuan.id_antrian);
      const antrianTujuan = await antrianModel.getAntrianById(checkDataTujuan.id_antrian_tujuan);
      //  request_tukar penukar kembali menjadi 1
      await antrianModel.putAntrian(checkDataTujuan.id_antrian, { request_tukar: 1 });

      await connection.commit();
      io.emit('server-putRequest', {
        user_id_asal: antrianAsal.user_id, user_id_tujuan: antrianTujuan.user_id, tanggal_periksa: helper.getFullDate(new Date(antrianAsal.tanggal_periksa)), id_praktek: antrianAsal.id_praktek,
      });

      return helper.response(response, 200, { message: 'put data Request Notifikasi  berhasil' }, result);
    } catch (error) {
      console.log(error);
      await connection.rollback();
      return helper.response(response, 500, { message: 'Post data Request Notifikasi  gagal' });
    }
  },
  postReverseWithOfflineQueue: async (request, response) => {
    await connection.beginTransaction();
    try {
      const setData = request.body;
      const { io } = request;

      const setDataNotif = {
        id_antrian: setData.id_antrian,
        text_notifikasi: 'Pengajuan pertukaran antrian',
        jenis_notifikasi: 2,
        aksi: 1,
        id_antrian_tujuan: setData.id_antrian_tujuan,
        is_opened: '0',
      };
        // proses tukar antrian
        // mendapatkan data antrian dari penukar
      const antrianAsal = await antrianModel.getAntrianById(setData.id_antrian);
      // mendapatkan data antrian dari yang akan ditukar
      const antrianTujuan = await antrianModel.getAntrianById(setData.id_antrian_tujuan);

      // mendapatkan semua antrian di tanggal dan poli yang sama
      const query = `WHERE id_praktek=${antrianAsal.id_praktek} 
      && tanggal_periksa='${helper.getFullDate(antrianAsal.tanggal_periksa)} 
      ORDER BY  status_antrian = 6 OR status_antrian = 7, urutan ASC'`;
      const queueList = await antrianModel.getAntrianAvailableByFilter(query);

      // mendapatkan data praktek
      const getPraktek = await praktekModel.getPraktekById(antrianAsal.id_praktek);

      // mencari antrian setelahnya diantara asal dan tujuan, juga antrian yang sama dengan tujuan (operator <=)
      const queueBetweenData = queueList.filter((item) => item.urutan > antrianAsal.urutan && item.urutan <= antrianTujuan.urutan);

      // ubah urutan antrian user menjadi urutan antrian tujuan dan request tukar menjadi 0
      await antrianModel.putAntrian(antrianAsal.id_antrian, {
        urutan: antrianTujuan.urutan,
        // nomor_antrian: antrianTujuan.nomor_antrian,
        estimasi_waktu_pelayanan: antrianTujuan.estimasi_waktu_pelayanan,
        request_tukar: 0,
      });
      // melakukan perubahan urutan menjadi -1 pada seluruh antrian dibawahnya dengan kondisi kurang dari sama dengan antrian tujuan

      if (queueBetweenData.length > 0) {
        for (let i = 0; i < queueBetweenData.length; i++) {
          await antrianModel.putAntrian(queueBetweenData[i].id_antrian, {
            urutan: parseInt(queueBetweenData[i].urutan, 10) - 1,
            // nomor_antrian: antrianAsal.nomor_antrian,
            estimasi_waktu_pelayanan: parseInt(queueBetweenData[i].estimasi_waktu_pelayanan, 10) - parseInt(getPraktek.waktu_pelayanan),
          });
        }
      }

      io.emit('server-putRequest', {
        user_id_asal: antrianAsal.user_id, user_id_tujuan: antrianTujuan.user_id, tanggal_periksa: helper.getFullDate(new Date(antrianAsal.tanggal_periksa)), id_praktek: antrianAsal.id_praktek,
      });

      const result = await notifikasiModel.postNotifikasi(setDataNotif);
      await connection.commit();
      return helper.response(response, 201, { message: 'Post data Reverse Antrian  berhasil' }, result);
    } catch (error) {
      console.log(error);
      await connection.rollback();
      return helper.response(response, 500, { message: 'Post data Notifikasi  gagal' });
    }
  },
  postNotifikasi: async (request, response) => {
    try {
      const setData = request.body;
      console.log(setData);
      if (parseInt(setData.jenis_notifikasi) === 1) {
        const checkUser = await userModel.getUserById(setData.nik_tujuan);
        if (!checkUser) {
          return helper.response(response, 404, { message: 'User dengan id tersebut tidak ditemukan' }, checkUser);
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
  postPublishNotifikasi: async (request, response) => {
    try {
      const setData = request.body;
      const tokens = fcmUsers.filter((item) => item.userId.split('--')[0] == setData.user_id).map((item) => item.token);
      if (tokens.length > 0) {
        await NotificationServiceInstance.publishNotification(setData.title, setData.body, tokens);
      }

      // setData.is_opened = 0;

      // const result = await notifikasiModel.postNotifikasi(setData);
      return helper.response(response, 201, { message: 'Publish Notifikasi  berhasil' });
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
