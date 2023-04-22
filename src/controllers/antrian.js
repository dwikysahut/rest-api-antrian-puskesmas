/* eslint-disable eqeqeq */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable camelcase */
/* eslint-disable no-shadow */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
const { nanoid } = require('nanoid');
const moment = require('moment');
const antrianModel = require('../models/antrian');
const praktekModel = require('../models/praktek');
const kartuKeluargaModel = require('../models/kartuKeluarga');
const detailRekamMedisModel = require('../models/detailRekamMedis');
const rekamMedisModel = require('../models/rekamMedis');
const detailAntrianModel = require('../models/detailAntrian');
const usersModel = require('../models/users');
const notifikasiModel = require('../models/notifikasi');
const pasienModel = require('../models/pasien');
const helper = require('../helpers');
const connection = require('../config/connection');

const {
  getFullDate, getFullTime, constTimeToMinute, TimeToMinute, timeToMinute,
} = require('../helpers');
const constant = require('../utils/constant');

module.exports = {
  getAllAntrian: async (request, response) => {
    try {
      const result = await antrianModel.getAllAntrian();
      return helper.response(response, 200, { message: 'Get All data Antrian berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Get All data Antrian gagal' });
    }
  },
  getInformasiAntrianSementara: async (request, response) => {
    try {
      const { id_praktek, tanggal_periksa } = request.query;
      const allAntrian = await antrianModel.getAntrianByDateAndPraktek(tanggal_periksa, id_praktek);
      const getPraktek = await praktekModel.getPraktekById(id_praktek);

      // cek apabila tanggal kunjungan adalah sebelum tanggal hari ini
      if (new Date(tanggal_periksa.split('/').reverse().join('-')) < new Date(getFullDate(null))) {
        return helper.response(response, 401, { message: 'Tanggal tidak boleh kurang dari hari ini' });
      }
      // cek apakah hari minggu
      const date = new Date(tanggal_periksa.split('/').reverse().join('-'));
      if (date.getDay() == 0) {
        return helper.response(response, 401, { message: 'Proses gagal, Pelayanan tutup di hari Minggu' });
      }
      // cek apakah untuk hari ini
      if (new Date(tanggal_periksa.split('/').reverse().join('-')).toLocaleDateString('id') == new Date(getFullDate(null)).toLocaleDateString('id')) {
        // jika hari jumat dan lebih dari jam 10 maka gagal
        if (date.getDay() == 5 && getFullTime() > '10:00:00') {
          return helper.response(response, 401, { message: 'Proses gagal, melebihi batas waktu pendaftaran' });
        }
        // jika hari sabtu dan lebih dari jam 11 maka gagal
        if (date.getDay() == 6 && getFullTime() > '11:00:00') {
          return helper.response(response, 401, { message: 'Proses gagal, melebihi batas waktu pendaftaran' });
        }
        // jika di hari senin - kamis dan lebih dari jam 12
        if (date.getDay() < 5 && getFullTime() > '12:00:00') {
          return helper.response(response, 401, { message: 'Proses gagal, melebihi batas waktu pendaftaran' });
        }
      }

      // // cek apabila melebihi jam pelayanan
      // if (new Date(tanggal_periksa.split('/').reverse().join('-')).toLocaleDateString('id') == new Date(getFullDate(null)).toLocaleDateString('id') && getFullTime() > '12:00:00') {
      //   return helper.response(response, 401, { message: 'Proses gagal, melebihi jam pelayanan' });
      // }

      // cek apakah untuk pendaftaran hari berikutnya
      if (new Date(tanggal_periksa.split('/').reverse().join('-')) > new Date(getFullDate(null))) {
        // apabila melebihi kuota booking maka gagal.

        if (allAntrian.filter((item) => item.booking == 1).length > getPraktek.kuota_booking) {
          const arr = [];
          // const beforeDate = '2023-03-22';
          const beforeDate = helper.getCustomDate('before', tanggal_periksa.split('/').reverse().join('-'));
          const afterDate = helper.getCustomDate('after', tanggal_periksa.split('/').reverse().join('-'));
          arr.push(beforeDate);
          arr.push(afterDate);
          const querySql = `WHERE tanggal_periksa='${beforeDate}' OR tanggal_periksa='${afterDate}' AND id_praktek=${id_praktek}`;
          const resultByDate = await antrianModel.getAntrianAvailableByFilter(querySql);
          const newResult = arr.map((item) => ({
            tanggal: getFullDate(item),
            sisa_kuota: getPraktek.kuota_booking - resultByDate.filter((itemAntrian) => new Date(itemAntrian.tanggal_periksa).toLocaleDateString('id') == new Date(item).toLocaleDateString('id')).length,
            // melakukan filter sesuai date, lalu mengembalikan object berupa nomor antrian yang sudah di split, dan di sort agar yang paling tinggi berada dipaling atas
            nomor_antrian: `${getPraktek.kode_poli}-${resultByDate.filter((itemAntrian) => new Date(itemAntrian.tanggal_periksa).toLocaleDateString('id') == new Date(item).toLocaleDateString('id')).map((item) => ({ nomor: parseInt(item.nomor_antrian.split('-')[1], 10) })).sort((a, b) => b.nomor - a.nomor)[0]?.nomor + 1 || 1}`,
            estimasi_waktu_pelayanan: resultByDate.filter((itemAntrian) => new Date(itemAntrian.tanggal_periksa).toLocaleDateString('id') == new Date(item).toLocaleDateString('id')).length * getPraktek.waktu_pelayanan,

          }));
          return helper.response(response, 403, { message: 'Kuota Pendaftaran pada tanggal yang dipilih telah habis ' }, newResult);
        }
      }
      // mengambil antrian sebelumnya yang masih aktif
      const UnfinishedQueueBeforeNow = allAntrian.filter((item) => item.status_antrian < 6);
      // hitung estimasi waktu antrian
      const totalEstimasiWaktu = UnfinishedQueueBeforeNow.length > 0 ? UnfinishedQueueBeforeNow.length * getPraktek.waktu_pelayanan : 0;
      // ambil antrian sebelumnya yang bukan prioritas
      const allQueueNotPriorityBeforeNow = allAntrian.filter((item) => item.prioritas == 0);
      // melakukan pengambilan data dari antrian yaitu nomor antrian lalu di sort berdasarkan paling tinggi dan diambil yang paling atas
      // contoh response
      // [
      //   { nomor: 5 },
      //   { nomor: 4 },
      //   { nomor: 3 },
      //   { nomor: 2 },
      //   { nomor: 1 }
      // }
      //
      const getDataMaxNomorAntrian = allQueueNotPriorityBeforeNow.map((item) => ({ nomor: parseInt(item.nomor_antrian.split('-')[1], 10) })).sort((a, b) => b.nomor - a.nomor)[0];

      const result = {
        sisa_antrian: UnfinishedQueueBeforeNow.length || 0,
        nomor_antrian: `${getPraktek.kode_poli}-${getDataMaxNomorAntrian ? getDataMaxNomorAntrian.nomor + 1 : 1}`,
        estimasi_waktu_pelayanan: totalEstimasiWaktu,
        tanggal_periksa,
        id_praktek,
        nama_poli: getPraktek.nama_poli,

      };

      return helper.response(response, 200, { message: 'Get Informasi data Antrian Sementara  berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Get Informasi data Antrian Sementara gagal' });
    }
  },
  getInformasiKuotaAntrian: async (request, response) => {
    try {
      const { id_praktek, tanggal_periksa } = request.query;
      const allAntrian = await antrianModel.getAntrianByDateAndPraktek(tanggal_periksa, id_praktek);
      const getPraktek = await praktekModel.getPraktekById(id_praktek);

      // cek apabila tanggal kunjungan adalah sebelum tanggal hari ini
      if (new Date(tanggal_periksa.split('/').reverse().join('-')) < new Date(getFullDate(null))) {
        return helper.response(response, 401, { message: 'Tanggal tidak boleh kurang dari hari ini' });
      }

      // cek apakah hari minggu
      const date = new Date(tanggal_periksa.split('/').reverse().join('-'));
      if (date.getDay() == 0) {
        return helper.response(response, 401, { message: 'Proses gagal, Pelayanan tutup di hari Minggu' });
      }
      // cek apabila hari ini namun melebihi jam pelayanan
      if (new Date(tanggal_periksa.split('/').reverse().join('-')).toLocaleDateString('id') == new Date(getFullDate(null)).toLocaleDateString('id')) {
        if (getFullTime() >= '07:30:00') {
          // jika hari jumat dan lebih dari jam 10 maka gagal
          if (date.getDay() == 5 && getFullTime() > '10:00:00') {
            return helper.response(response, 401, { message: 'Proses gagal, melebihi batas waktu pendaftaran' });
          }
          // jika hari sabtu dan lebih dari jam 11 maka gagal
          if (date.getDay() == 6 && getFullTime() > '11:00:00') {
            return helper.response(response, 401, { message: 'Proses gagal, melebihi batas waktu pendaftaran' });
          }
          // jika di hari senin - kamis dan lebih dari jam 12
          if (date.getDay() < 5 && getFullTime() > '12:00:00') {
            return helper.response(response, 401, { message: 'Proses gagal, melebihi batas waktu pendaftaran' });
          }
        } else {
          return helper.response(response, 401, { message: 'Proses gagal,  diluar waktu pendaftaran' });
        }
      }
      // if (new Date(tanggal_periksa.split('/').reverse().join('-')).toLocaleDateString('id') == new Date(getFullDate(null)).toLocaleDateString('id') && getFullTime() > '12:00:00') {
      //   return helper.response(response, 401, { message: 'Proses gagal, melebihi jam pelayanan' });
      // }

      // cek apakah untuk pendaftaran hari ini atau di lain hari
      if (new Date(tanggal_periksa.split('/').reverse().join('-')) > new Date(getFullDate(null))) {
        // apabila melebihi kuota booking maka gagal.
        if (allAntrian.filter((item) => item.booking == 1).length > getPraktek.kuota_booking) {
          return helper.response(response, 403, { message: 'Kuota Pendaftaran pada tanggal yang dipilih habis ' }, {});
        }
      }

      return helper.response(response, 200, { message: 'Kuota Tersedia, Silahkan melakukan pendaftaran' }, allAntrian);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Get Informasi data Antrian Sementara gagal' });
    }
  },
  getAllAntrianByFilter: async (request, response) => {
    try {
      let sqlQuery = '';
      let count = 0;
      if (request.query.id_praktek || request.query.tanggal_periksa) {
        sqlQuery += 'WHERE ';

        if (request.query.id_praktek) {
          sqlQuery += count > 0 ? `AND id_praktek=${request.query.id_praktek} ` : `id_praktek=${request.query.id_praktek} `;

          count += 1;
        }
        if (request.query.tanggal_periksa) {
          sqlQuery += count > 0 ? `AND tanggal_periksa='${request.query.tanggal_periksa}' ` : `tanggal_periksa='${request.query.tanggal_periksa}' `;
          count += 1;
        }
      }
      sqlQuery += 'ORDER BY  status_antrian = 6 OR status_antrian = 7, urutan ASC';

      console.log(sqlQuery);
      const result = await antrianModel.getAntrianAvailableByFilter(sqlQuery);
      return helper.response(response, 200, { message: 'Get All data Antrian berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Get All data Antrian gagal' });
    }
  },
  getAntrianByUserId: async (request, response) => {
    try {
      const { id } = request.params;
      const { token } = request;
      // request.token.result.user_id = '1111111111111111';

      const allAntrianByUser = await antrianModel.getAntrianByUserId(request.token.result.user_id);
      // mendapatkan data antrian yang belum selesai;
      const sqlQuery = 'WHERE status_antrian < 6 ORDER BY  status_antrian = 6 OR status_antrian = 7, urutan ASC';
      const resultUnfinishedAllAntrian = await antrianModel.getAntrianAvailableByFilter(sqlQuery);

      // mendapatkan array baru dari hasil filter antrian by user id
      // dibandingkan dengan semua antrian yang belum selesai
      // dengan membandingkan tanggal periksa yang sama, id_praktek yang sama
      // urutan pada semua antrian yang belum selesai kurang dari setiap antrian pada user (urutan sebelum antrian user)
      // dan diambil kecuali id antrian tersebut sama (agar mendapatkan antrian lain tanpa dirinya)
      const resultForUnfinishedQueue = allAntrianByUser.filter((item) => item.status_antrian < 6).map((item) => ({
        ...item,
        sisa_antrian: resultUnfinishedAllAntrian.filter((itemAntrian) => itemAntrian.id_praktek == item.id_praktek
          && new Date(itemAntrian.tanggal_periksa).toLocaleDateString('id') == new Date(item.tanggal_periksa).toLocaleDateString('id')
          && itemAntrian.id_antrian !== item.id_antrian
          && itemAntrian.urutan < item.urutan).length || 0,
      }));
      // mengambil data dari allAntrian yang sudah selesai / tidak ada di array resultForUnfinishedQueue
      const resultForFinishedQueue = allAntrianByUser.filter((item) => !resultForUnfinishedQueue.some((itemCompare) => item.id_antrian == itemCompare.id_antrian));

      const result = [
        ...resultForUnfinishedQueue,
        ...resultForFinishedQueue,
      ];
      return helper.response(response, 200, { message: 'Get All data Antrian By User ID berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Get All  data Antrian By User ID gagal' });
    }
  },
  getAntrianByNoKK: async (request, response) => {
    try {
      const { id } = request.params;
      const { token } = request;
      const result = await antrianModel.getAntrianByNoKK(id);
      return helper.response(response, 200, { message: 'Get data Antrian by No KK berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Get data Antrian by No KK  gagal' });
    }
  },
  getAntrianByPraktek: async (request, response) => {
    try {
      const { date } = request.query;
      console.log(date);
      const praktekArr = await praktekModel.getAllPraktek();
      const antrianArr = await antrianModel.getAntrianJustByDate(date);
      console.log(antrianArr);

      const newResult = praktekArr.map((itemPraktek) => (
        {
          ...itemPraktek,
          id_praktek: itemPraktek.id_praktek,
          tanggal: date,
          total_antrian: antrianArr.filter((itemAntrian) => itemPraktek.id_praktek === itemAntrian.id_praktek).length,
          antrian_sekarang: antrianArr.filter((itemAntrian) => itemPraktek.id_praktek === itemAntrian.id_praktek && itemAntrian.status_antrian == 5)[0],
          data_antrian: antrianArr.filter((itemAntrian) => itemPraktek.id_praktek === itemAntrian.id_praktek),

        }
      ));
      // const newResult

      console.log(newResult);
      return helper.response(response, 200, { message: 'Get All data Antrian berhasil' }, newResult);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Get All data Antrian gagal' });
    }
  },
  getAntrianByNik: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await antrianModel.getAntrianByNik(id);
      return helper.response(response, 200, { message: 'Get All data Antrian berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get All data Antrian gagal' });
    }
  },
  getAntrianById: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await antrianModel.getAntrianById(id);
      if (!result) {
        return helper.response(response, 404, { message: 'Data Antrian tidak Ditemukan' });
      }
      return helper.response(response, 200, { message: 'Get data Antrian berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Get data Antrian gagal' });
    }
  },

  postAntrian: async (request, response) => {
    console.log(request.body.nik);
    await connection.beginTransaction();
    try {
      const setData = request.body;
      console.log(setData.nik);

      const { io, token } = request;
      // cek apakah akun tersuspend
      const getUser = await usersModel.getUserById(setData.user_id);
      if (getUser.is_suspend == 1) {
        await connection.rollback();

        return helper.response(response, 401, { message: 'Akun anda telah di suspend, silahkan menghubungi admin' });
      }

      // cek tanggal periksa apakah kurang dari tanggal sekarang
      if (new Date(setData.tanggal_periksa.split('/').reverse().join('-')) < new Date(getFullDate(null))) {
        await connection.rollback();

        return helper.response(response, 401, { message: 'Tanggal tidak boleh kurang dari hari ini' });
      }

      // cek apakah hari minggu
      const date = new Date(setData.tanggal_periksa.split('/').reverse().join('-'));
      if (date.getDay() == 0) {
        await connection.rollback();
        return helper.response(response, 401, { message: 'Proses gagal, Pelayanan tutup di hari Minggu' });
      }
      // cek apakah untuk hari ini
      if (new Date(setData.tanggal_periksa.split('/').reverse().join('-')).toLocaleDateString('id') == new Date(getFullDate(null)).toLocaleDateString('id')) {
        // jika hari jumat dan lebih dari jam 10 maka gagal
        if (date.getDay() == 5 && getFullTime() > '10:00:00') {
          await connection.rollback();

          return helper.response(response, 401, { message: 'Proses gagal, melebihi batas waktu pendaftaran' });
        }
        // jika hari sabtu dan lebih dari jam 11 maka gagal
        if (date.getDay() == 6 && getFullTime() > '11:00:00') {
          await connection.rollback();
          return helper.response(response, 401, { message: 'Proses gagal, melebihi batas waktu pendaftaran' });
        }
        // jika di hari senin - kamis dan lebih dari jam 12
        if (date.getDay() < 5 && getFullTime() > '12:00:00') {
          await connection.rollback();
          return helper.response(response, 401, { message: 'Proses gagal,  melebihi batas waktu pendaftaran' });
        }
      }

      if (new Date(setData.tanggal_periksa.split('/').reverse().join('-')) > new Date(getFullDate(null))) setData.booking = 1;
      else setData.booking = 0;

      const setDataKk = {
        no_kk: setData.no_kk,
        kepala_keluarga: setData.kepala_keluarga,

      };
      const setDataRM = {
        no_rm: setData.no_rm,
        no_kk: setData.no_kk,

      };
      const setDataDetailRM = {
        no_rm: setData.no_rm,
        nik: setData.nik,
        id_rak: setData.id_rak,

      };
      const setDataPasien = {
        nik: setData.nik,
        no_kk: setData.no_kk,

        nama: setData.nama,
        ttl: setData.ttl,
        jenis_kelamin: setData.jenis_kelamin,
        alamat: setData.alamat,
        rt: setData.rt,
        rw: setData.rw,
        kelurahan: setData.kelurahan,
        kecamatan: setData.kecamatan,
        no_telepon: setData.no_telepon,
        bpjs: setData.bpjs,
        nomor_kartu_bpjs: setData.nomor_kartu_bpjs ? setData.nomor_kartu_bpjs : '',
        pekerjaan: setData.pekerjaan,
        kuota_daftar: setData.kuota_daftar || 0,
        url_foto_kartu_identitas: setData.url_foto_kartu_identitas ? setData.url_foto_kartu_identitas : '',
        pendidikan_terakhir: setData.pendidikan_terakhir,
        status_anggota_keluarga: setData.status_anggota_keluarga,
      };
      // cek kuota daftar pada pasien pendaftar
      const checkPasien = await pasienModel.getPasienById(setDataPasien.nik);
      if (checkPasien?.kuota_daftar < 1) {
        await connection.rollback();
        return helper.response(response, 403, { message: 'Pasien telah terdaftar pada antrian ' }, {});
      }
      const getPraktek = await praktekModel.getPraktekById(setData.id_praktek);
      // mendapatkan antrian
      const checkAntrian = await antrianModel.getAntrianByDateAndPraktek(setData.tanggal_periksa.split('/').reverse().join('-'), setData.id_praktek);
      // mendapatkan antrian yang belum selesai / tidak batal
      const checkAntrianKuota = await antrianModel.getAntrianAvailableByDate(setData.tanggal_periksa.split('/').reverse().join('-'), setData.id_praktek);

      // cek kuota antrian di poli tertentu dari praktek
      if (setData.booking == 1 && checkAntrian.filter((item) => item.booking == 1).length >= getPraktek.kuota_booking) {
        await connection.rollback();
        return helper.response(response, 403, { message: 'Kuota Pendaftaran pada tanggal yang dipilih habis ' }, {});
      }

      // apabila antrian prioritas
      if (setData.prioritas > 0) {
        if (checkAntrianKuota.length > 0) {
          const queueHaventBeenCalled = checkAntrianKuota.filter((item) => item.status_antrian < 5);

          // cek apakah antrian pertama prioritas 0
          if (queueHaventBeenCalled[0].prioritas == 0) {
            setData.urutan = queueHaventBeenCalled[0].urutan;

            // nomor antrian adalah jumlah pasien prioritas terakhir diatasnya +1
            const checkPriorityAntrian = checkAntrian.filter((item) => item.prioritas > 0);
            const lastDataAntrian = checkPriorityAntrian[checkPriorityAntrian.length - 1];

            const lastNomorAntrian = lastDataAntrian ? parseInt(lastDataAntrian.nomor_antrian.split('-')[1].split('')[0], 10) + 1 : 1;
            setData.nomor_antrian = `${getPraktek.kode_poli}-${lastNomorAntrian}P`;
            // update semua urutan pada antrian  menjadi +1
            for (let i = 0; i < queueHaventBeenCalled.length; i++) {
              await antrianModel.putAntrian(queueHaventBeenCalled[i].id_antrian, { urutan: queueHaventBeenCalled[i].urutan + 1 });
            }
          } else {
            // mencari dengan prioritas 1 dan menambahkan setelahnya
            let firstIndexTarget;
            for (let i = 0; i < queueHaventBeenCalled.length; i++) {
              // menemukan data pertama dengan prioritas 0, lalu ambil urutannya
              // ambil urutan dari data dengan prioritas 0 paling awal
              if (queueHaventBeenCalled[i].prioritas == 0) {
                setData.urutan = queueHaventBeenCalled[i].urutan;

                // nomor antrian adalah jumlah pasien prioritas terakhir diatasnya +1
                const checkPriorityAntrian = checkAntrian.filter((item) => item.prioritas > 0);
                const lastDataAntrian = checkPriorityAntrian[checkPriorityAntrian.length - 1];

                const lastNomorAntrian = lastDataAntrian ? parseInt(lastDataAntrian.nomor_antrian.split('-')[1].split('')[0], 10) + 1 : 1;
                setData.nomor_antrian = `${getPraktek.kode_poli}-${lastNomorAntrian}P`;
                firstIndexTarget = i;
                break;
              }
            }
            // update urutan antrian target dan seluruh antrian setelahnya menjadi +1

            for (let i = firstIndexTarget; i < queueHaventBeenCalled.length; i++) {
              await antrianModel.putAntrian(queueHaventBeenCalled[i].id_antrian, { urutan: queueHaventBeenCalled[i].urutan + 1 });
            }
          }
        } else {
          // untuk kondisi tidak ada antrian aktif / belum dilayani di poli maka seperti input biasa
          // set urutan dan tiket antrian
          const formattedDate = setData.tanggal_periksa.split('/').reverse().join('-');
          // mendapatkan last urutan di antrian pada taggal dan poli yang dituju
          const lastDataByUrutan = await antrianModel.getAntrianSequentialByDate(formattedDate, setData.id_praktek);
          setData.urutan = lastDataByUrutan.last_number > 0 ? lastDataByUrutan.last_number + 1 : 1;

          // set nomor antrian dari no antrian terakhir lalu +1 agar selalu berurutan
          // (tidak mengikuti urutan agar saat ada pasien darurat tidak lompat nomornya)
          const antrianPriority = checkAntrian.filter((item) => item.prioritas > 0);
          const lastDataAntrian = antrianPriority[antrianPriority.length - 1];

          const lastNomorAntrian = lastDataAntrian ? parseInt(lastDataAntrian.nomor_antrian.split('-')[1].split('')[0], 10) + 1 : 1;
          setData.nomor_antrian = `${getPraktek.kode_poli}-${lastNomorAntrian}P`;
        }
      }
      // bukan prioritas
      else {
      // set urutan dan tiket antrian
        const formattedDate = setData.tanggal_periksa.split('/').reverse().join('-');
        // mendapatkan last urutan di antrian pada taggal dan poli yang dituju
        const lastDataByUrutan = await antrianModel.getAntrianSequentialByDate(formattedDate, setData.id_praktek);
        setData.urutan = lastDataByUrutan.last_number > 0 ? lastDataByUrutan.last_number + 1 : 1;

        // set nomor antrian dari no antrian terakhir lalu +1 agar selalu berurutan
        // (tidak mengikuti urutan agar saat ada pasien darurat tidak lompat nomornya)
        const antrianNoPriority = checkAntrian.filter((item) => item.prioritas == 0);
        // car ke 1 mendapatkan data antrian terakhir dari array

        // const lastDataAntrian = antrianNoPriority[antrianNoPriority.length - 1];
        // const lastNomorAntrian = lastDataAntrian ? parseInt(lastDataAntrian.nomor_antrian.split('-')[1], 10) + 1 : 1;

        // cara ke 2 mendapatkan data antrian dengan nomor antrian terbesar dengan mengurutkan descendant

        const lastDataAntrian = antrianNoPriority.map((item) => ({ nomor: parseInt(item.nomor_antrian.split('-')[1], 10) })).sort((a, b) => b.nomor - a.nomor)[0];
        const lastNomorAntrian = lastDataAntrian ? lastDataAntrian.nomor + 1 : 1;
        setData.nomor_antrian = `${getPraktek.kode_poli}-${lastNomorAntrian}`;
      }
      // status update saat daftar di web(admin) atau petugas  maka status hadir 1 / hadir
      setData.status_hadir = request.token.result.role < 3 ? 1 : 0;
      setData.status_antrian = 1;
      setData.request_tukar = 1;

      // setData.tgl_periksa = setData.tgl_periksa.split('/').reverse().join('-');
      let roleSumber;
      if (request.token.result.role === 1) {
        roleSumber = 'Admin';
      } else if (request.token.result.role === 2) {
        roleSumber = 'Petugas';
      } else {
        roleSumber = 'Pasien';
      }
      // const checkFinishedAntrian=await antrianModel
      // if(checkData)

      const setDataAntrian = {
        id_antrian: new Date().getTime() + Math.floor(Math.random() * 100),
        user_id: setData.user_id,
        id_praktek: setData.id_praktek,
        nik: setData.nik,
        nomor_antrian: setData.nomor_antrian,
        tanggal_periksa: setData.tanggal_periksa.split('/').reverse().join('-'),
        prioritas: setData.prioritas || 0,
        urutan: setData.urutan,
        keluhan: setData.keluhan,
        daftar_dengan_bpjs: setData.daftar_dengan_bpjs,
        estimasi_waktu_pelayanan: 0,
        status_hadir: setData.status_hadir,
        status_antrian: setData.status_antrian,
        booking: setData.booking,
        sumber: `${setData.sumber}-${roleSumber}`,
        waktu_kehadiran: null,
        request_tukar: setData.request_tukar,
      };

      // menghitung estimasi waktu pada pasien yang akan mendaftar.

      // const checkFinishedQueue = checkAntrian.filter((item) => item.status_antrian == 6);
      // const checkUnfinishedQueue = checkAntrian.filter((item) => item.status_antrian < 6);
      // const averageFinishedQueue = checkFinishedQueue.length > 0 ? checkFinishedQueue.reduce((acc, item) => acc + item.total_waktu_pelayanan, 0) : 0;
      // const averageUnfinishedQueue = checkUnfinishedQueue.length > 0 ? getPraktek.waktu_pelayanan * checkUnfinishedQueue.length : 0;
      // let rataEstimasiWaktu = 0;
      // if (averageFinishedQueue > 0 || averageUnfinishedQueue > 0) {
      //   rataEstimasiWaktu = (averageFinishedQueue + averageUnfinishedQueue) / (checkFinishedQueue.length + checkUnfinishedQueue.length);
      // }

      // cek apabila orang pertama atau rata2 = 0 maka menggunakan default yaitu 0
      // const totalEstimasiWaktu = rataEstimasiWaktu == 0 ? 0 : Math.floor(rataEstimasiWaktu * checkUnfinishedQueue.length);

      // alternatif 2 => dibuat sama 10 menit
      const UnfinishedQueueBeforeNow = checkAntrian.filter((item) => item.status_antrian < 6);
      const totalEstimasiWaktu = UnfinishedQueueBeforeNow.length > 0 ? UnfinishedQueueBeforeNow.length * getPraktek.waktu_pelayanan : 0;

      // setDataAntrian.estimasi_waktu_pelayanan = checkAntrian.length > 0 ? totalEstimasiWaktu : getPraktek.waktu_pelayanan;
      setDataAntrian.estimasi_waktu_pelayanan = totalEstimasiWaktu;

      // 1. cek data kartu keluarga
      const checkKK = await kartuKeluargaModel.getnoKKByID(setDataKk.no_kk);
      if (!checkKK) {
        const res = await kartuKeluargaModel.postKartuKeluarga(setDataKk);
        // console.log(res);
      } else {
        const putDataKK = {
          ...setDataKk,

        };
        await kartuKeluargaModel.putKartuKeluarga(setDataKk.no_kk, { kepala_keluarga: putDataKK.kepala_keluarga });
      }
      // 2. cek data pasien
      if (!checkPasien) {
        await pasienModel.postPasien(setDataPasien);
      } else {
        const putDataPasien = {
          ...setDataPasien,
        };
        delete putDataPasien.nik;
        await pasienModel.putPasien(setDataPasien.nik, { ...putDataPasien, kuota_daftar: 0 });
      }
      // 3. cek data RM
      if (setData.no_rm) {
        console.log('ini saat setdata rm ada');
        const checkRM = await rekamMedisModel.getRekamMedisById(setData.no_rm);
        console.log(checkRM);

        if (!checkRM) {
        // saat tidak ada data RM dari no RM
          await rekamMedisModel.postRekamMedis(setDataRM);
        } else if (checkRM && checkRM.no_kk !== setData.no_kk) {
          // opsi terbaik adalah melakukan peringatan
          await connection.rollback();
          return helper.response(response, 409, { message: 'No. Rekam medis sudah digunakan' }, {});

          // ganti kartu keluarga yang lama dengan no rm=null
          // set no kk pada data rekam medis dengan no_kk saat ini pada body

          // await kartuKeluargaModel.putKartuKeluarga(checkRM.no_kk, { no_rm: null });
          // await rekamMedisModel.putRekamMedis(checkRM.no_rm, { no_kk: setData.no_kk });
        }
        // edit RM di kartu keluarga saat ini pada body
        await kartuKeluargaModel.putKartuKeluarga(setDataKk.no_kk, { no_rm: setData.no_rm });
      }
      // get data kk terbaru
      const checkNewestKK = await kartuKeluargaModel.getnoKKByID(setDataKk.no_kk);
      // if (checkNewestKK.no_rm == null) {
      //   await connection.rollback();
      //   return helper.response(response, 403, { message: 'No. RM pada Kartu keluarga masih null' }, {});
      // }

      // 4. detail rekam medis

      // cek apakah no RM pada data kartu keluarga null
      if (checkNewestKK.no_rm !== null) {
        const checkDetailRM = await detailRekamMedisModel.getDetailRekamMedisByNIK(setData.nik);
        if (!checkDetailRM) {
          console.log('detail rekam medis');
          // input data detail saat tidak ada data berdasarkan NIK di detail RM
          await detailRekamMedisModel.postDetailRekamMedis(setDataDetailRM);
        } else {
          console.log('edit detail rekam medis');
          // apabila ada, maka edit
          await detailRekamMedisModel.putDetailRekamMedis(checkDetailRM.id_detail_rekam_medis, { id_rak: setDataDetailRM.id_rak });
        }
      }
      // 5. antrian

      const result = await antrianModel.postAntrian(setDataAntrian);
      const newResult = {
        ...setDataAntrian,
        created_at: new Date(),
        updated_at: new Date(),

      };

      if (result) {
        io.emit('server-addAntrian', { result: newResult });
      }
      await connection.commit();
      return helper.response(response, 201, { message: 'Post data Antrian berhasil' }, newResult);
    } catch (error) {
      console.log(error);
      await connection.rollback();
      return helper.response(response, 500, { message: 'Post data Antrian gagal' });
    }
  },

  postAntrianByPetugas: async (request, response) => {
    await connection.beginTransaction();
    try {
      const setData = request.body;
      const { io, token } = request;
      setData.tanggal_periksa = getFullDate(null);

      // setData.tgl_periksa = setData.tgl_periksa.split('/').reverse().join('-');

      // cek apakah hari minggu
      const date = new Date(setData.tanggal_periksa.split('/').reverse().join('-'));
      if (date.getDay() == 0) {
        await connection.rollback();
        return helper.response(response, 401, { message: 'Proses gagal, Pelayanan tutup di hari Minggu' });
      }
      // cek apakah untuk hari ini
      if (new Date(setData.tanggal_periksa.split('/').reverse().join('-')).toLocaleDateString('id') == new Date(getFullDate(null)).toLocaleDateString('id')) {
        if (getFullTime() >= '07:30:00') {
          // jika hari jumat dan lebih dari jam 10 maka gagal
          if (date.getDay() == 5 && getFullTime() > '10:00:00') {
            await connection.rollback();

            return helper.response(response, 401, { message: 'Proses gagal, melebihi batas waktu pendaftaran' });
          }
          // jika hari sabtu dan lebih dari jam 11 maka gagal
          if (date.getDay() == 6 && getFullTime() > '11:00:00') {
            await connection.rollback();
            return helper.response(response, 401, { message: 'Proses gagal, melebihi batas waktu pendaftaran' });
          }
          // jika di hari senin - kamis dan lebih dari jam 12
          if (date.getDay() < 5 && getFullTime() > '12:00:00') {
            await connection.rollback();
            return helper.response(response, 401, { message: 'Proses gagal, melebihi batas waktu pendaftaran' });
          }
        } else {
          await connection.rollback();
          return helper.response(response, 401, { message: 'Proses gagal,  diluar waktu pendaftaran' });
        }
      }

      let roleSumber;
      if (request.token.result.role === 1) {
        roleSumber = 'Admin';
      } else if (request.token.result.role === 2) {
        roleSumber = 'Petugas';
      } else {
        roleSumber = 'Pasien';
      }

      // mendapatkan data praktek by ID
      const getPraktek = await praktekModel.getPraktekById(setData.id_praktek);
      // mendapatkan antrian
      const checkAntrian = await antrianModel.getAntrianByDateAndPraktek(setData.tanggal_periksa.split('/').reverse().join('-'), setData.id_praktek);
      // mendapatkan antrian yang belum selesai / tidak batal
      const checkAntrianKuota = await antrianModel.getAntrianAvailableByDate(setData.tanggal_periksa.split('/').reverse().join('-'), setData.id_praktek);

      // cek kuota antrian di poli tertentu dari praktek
      // if (setData.booking == 1 && checkAntrian.filter((item) => item.booking == 1).length >= getPraktek.kuota_booking) {
      //   await connection.rollback();
      //   return helper.response(response, 403, { message: 'Kuota Pendaftaran pada tanggal yang dipilih habis ' }, {});
      // }

      // apabila antrian prioritas
      if (setData.prioritas > 0) {
        if (checkAntrianKuota.length > 0) {
          const queueHaventBeenCalled = checkAntrianKuota.filter((item) => item.status_antrian < 5);

          // cek apakah antrian pertama prioritas 0
          if (queueHaventBeenCalled[0].prioritas == 0) {
            setData.urutan = queueHaventBeenCalled[0].urutan;

            // nomor antrian adalah jumlah pasien prioritas terakhir diatasnya +1
            const checkPriorityAntrian = checkAntrian.filter((item) => item.prioritas > 0);
            const lastDataAntrian = checkPriorityAntrian[checkPriorityAntrian.length - 1];

            const lastNomorAntrian = lastDataAntrian ? parseInt(lastDataAntrian.nomor_antrian.split('-')[1].split('')[0], 10) + 1 : 1;
            setData.nomor_antrian = `${getPraktek.kode_poli}-${lastNomorAntrian}P`;
            // update semua urutan pada antrian  menjadi +1
            for (let i = 0; i < queueHaventBeenCalled.length; i++) {
              await antrianModel.putAntrian(queueHaventBeenCalled[i].id_antrian, { urutan: queueHaventBeenCalled[i].urutan + 1 });
            }
          } else {
            // mencari dengan prioritas 1 dan menambahkan setelahnya
            let firstIndexTarget;
            for (let i = 0; i < queueHaventBeenCalled.length; i++) {
              // menemukan data pertama dengan prioritas 0, lalu ambil urutannya
              // ambil urutan dari data dengan prioritas 0 paling awal
              if (queueHaventBeenCalled[i].prioritas == 0) {
                setData.urutan = queueHaventBeenCalled[i].urutan;

                // nomor antrian adalah jumlah pasien prioritas terakhir diatasnya +1
                const checkPriorityAntrian = checkAntrian.filter((item) => item.prioritas > 0);
                const lastDataAntrian = checkPriorityAntrian[checkPriorityAntrian.length - 1];

                const lastNomorAntrian = lastDataAntrian ? parseInt(lastDataAntrian.nomor_antrian.split('-')[1].split('')[0], 10) + 1 : 1;
                setData.nomor_antrian = `${getPraktek.kode_poli}-${lastNomorAntrian}P`;
                firstIndexTarget = i;
                break;
              }
            }
            // update urutan antrian target dan seluruh antrian setelahnya menjadi +1

            for (let i = firstIndexTarget; i < queueHaventBeenCalled.length; i++) {
              await antrianModel.putAntrian(queueHaventBeenCalled[i].id_antrian, { urutan: queueHaventBeenCalled[i].urutan + 1 });
            }
          }
        } else {
          // untuk kondisi tidak ada antrian aktif / belum dilayani di poli maka seperti input biasa
          // set urutan dan tiket antrian
          const formattedDate = setData.tanggal_periksa.split('/').reverse().join('-');
          // mendapatkan last urutan di antrian pada taggal dan poli yang dituju
          const lastDataByUrutan = await antrianModel.getAntrianSequentialByDate(formattedDate, setData.id_praktek);
          setData.urutan = lastDataByUrutan?.last_number > 0 ? lastDataByUrutan.last_number + 1 : 1;

          // set nomor antrian dari no antrian terakhir lalu +1 agar selalu berurutan
          // (tidak mengikuti urutan agar saat ada pasien darurat tidak lompat nomornya)
          const antrianPriority = checkAntrian.filter((item) => item.prioritas > 0);
          const lastDataAntrian = antrianPriority[antrianPriority.length - 1];

          const lastNomorAntrian = lastDataAntrian ? parseInt(lastDataAntrian.nomor_antrian.split('-')[1].split('')[0], 10) + 1 : 1;
          setData.nomor_antrian = `${getPraktek.kode_poli}-${lastNomorAntrian}P`;
        }
      } else {
      // set urutan dan tiket antrian
        const formattedDate = setData.tanggal_periksa.split('/').reverse().join('-');
        // mendapatkan last urutan di antrian pada taggal dan poli yang dituju
        const lastDataByUrutan = await antrianModel.getAntrianSequentialByDate(formattedDate, setData.id_praktek);
        setData.urutan = lastDataByUrutan?.last_number > 0 ? lastDataByUrutan.last_number + 1 : 1;

        // set nomor antrian dari no antrian terakhir lalu +1 agar selalu berurutan
        // (tidak mengikuti urutan agar saat ada pasien darurat tidak lompat nomornya)
        const antrianNoPriority = checkAntrian.filter((item) => item.prioritas == 0);
        const lastDataAntrian = antrianNoPriority[antrianNoPriority.length - 1];

        const lastNomorAntrian = lastDataAntrian ? parseInt(lastDataAntrian.nomor_antrian.split('-')[1], 10) + 1 : 1;
        setData.nomor_antrian = `${getPraktek.kode_poli}-${lastNomorAntrian}`;
      }
      // status update saat daftar di web(admin) atau petugas  maka status hadir 1 / hadir
      setData.status_hadir = request.token.result.role < 3 ? 1 : 0;
      setData.status_antrian = 1;
      setData.request_tukar = 0;

      // setData.tgl_periksa = setData.tgl_periksa.split('/').reverse().join('-');

      const setDataAntrian = {
        id_antrian: new Date().getTime() + Math.floor(Math.random() * 100),
        id_praktek: setData.id_praktek,
        tanggal_periksa: new Date(getFullDate(null)),
        user_id: request.token.result.user_id,
        booking: 0,
        prioritas: setData.prioritas,
        request_tukar: 0,
        nomor_antrian: setData.nomor_antrian,
        urutan: setData.urutan,

        status_hadir: 1,
        status_antrian: 1,
        sumber: `${setData.sumber}-${roleSumber}`,
      };

      // alternatif 2 => dibuat sama 10 menit
      const UnfinishedQueueBeforeNow = checkAntrian.filter((item) => item.status_antrian < 6);
      const totalEstimasiWaktu = UnfinishedQueueBeforeNow.length > 0 ? UnfinishedQueueBeforeNow.length * getPraktek.waktu_pelayanan : 0;

      // setDataAntrian.estimasi_waktu_pelayanan = checkAntrian.length > 0 ? totalEstimasiWaktu : getPraktek.waktu_pelayanan;
      setDataAntrian.estimasi_waktu_pelayanan = totalEstimasiWaktu;

      // 5. antrian
      console.log(setDataAntrian);
      await antrianModel.postAntrian(setDataAntrian);
      // get antrian terbaru
      const result = await antrianModel.getAntrianById(setDataAntrian.id_antrian);
      result.sisa_antrian = checkAntrianKuota.length;
      // if (result) {
      console.log('emit');
      io.emit('server-addAntrian', { result });
      // }
      await connection.commit();
      return helper.response(response, 201, { message: 'Post data Antrian berhasil' }, result);
    } catch (error) {
      console.log(error);
      await connection.rollback();
      return helper.response(response, 500, { message: 'Post data Antrian gagal' });
    }
  },

  putStatusAntrian: async (request, response) => {
    await connection.beginTransaction();
    try {
      const setData = request.body;
      const { id } = request.params;
      const { io, token } = request;
      // console.log('lewat');
      // if update status antrian

      const checkData = await antrianModel.getAntrianById(id);

      // cek apakah tanggal hari ini sama dengan tanggal periksa/kunjungan

      if (new Date(checkData.tanggal_periksa).toLocaleDateString('id') !== new Date(getFullDate(null)).toLocaleDateString('id')) {
        await connection.rollback();
        return helper.response(response, 401, { message: 'Waktu Kunjungan bukan untuk hari ini' });
      }
      // cek apakah hari minggu
      const date = new Date(checkData.tanggal_periksa);
      console.log(`hari ${date.getDay()}`);

      // cek apakah untuk hari ini
      if (new Date(checkData.tanggal_periksa).toLocaleDateString('id') == new Date(getFullDate(null)).toLocaleDateString('id')) {
        if (getFullTime() >= '07:30:00') {
          // jika hari jumat dan lebih dari jam 10 maka gagal
          if (date.getDay() == 5 && getFullTime() > '11:00:00') {
            await connection.rollback();

            return helper.response(response, 401, { message: 'Proses gagal, melebihi batas waktu pendaftaran' });
          }
          // jika hari sabtu dan lebih dari jam 11 maka gagal
          if (date.getDay() == 6 && getFullTime() > '11:30:00') {
            await connection.rollback();
            return helper.response(response, 401, { message: 'Proses gagal, melebihi batas waktu pendaftaran' });
          }
          // jika di hari senin - kamis dan lebih dari jam 12
          if (date.getDay() < 5 && getFullTime() > '15:00:00') {
            await connection.rollback();
            return helper.response(response, 401, { message: 'Proses gagal, melebihi batas waktu pendaftaran' });
          }
        } else {
          await connection.rollback();
          return helper.response(response, 401, { message: 'Proses gagal,  diluar waktu pendaftaran' });
        }
      }
      if (setData.status_antrian) {
        const setDataAntrian = {

          status_antrian: setData.status_antrian,

        };
        // saat antrian lompat/ tidak urut dalam merubah status antrian
        if (setDataAntrian.status_antrian !== 7 && (parseInt(setDataAntrian.status_antrian, 10) - parseInt(checkData.status_antrian, 10) > 1)) {
          await connection.rollback();
          return helper.response(response, 401, { message: 'Mohon untuk mengikuti proses secara runtut' });
        }
        // cek ketersediaan data
        if (!checkData) {
          await connection.rollback();
          return helper.response(response, 404, { message: 'Data Antrian tidak Ditemukan' });
        }

        // PROSES DETAIL ANTRIAN

        // - terdaftar-diproses input detail antrian (proses administrasi-formulir)
        if (parseInt(setDataAntrian.status_antrian, 10) === 2) {
          console.log('2 nih');
          const setDataDetailAntrian = {
            id_antrian: id,
            id_tahap_pelayanan: 1,
            waktu_mulai_pelayanan: getFullTime().toString(),
          };
          await detailAntrianModel.postDetailAntrian(setDataDetailAntrian);
        }

        // - diproses-menunggu pembayaran -> update waktu selesai detail antrian (proses administrasi)
        if (parseInt(setDataAntrian.status_antrian, 10) === 3) {
          // const setData = request.body;

          const setDataDetailAntrian = {
            waktu_selesai_pelayanan: getFullTime().toString(),
          };
          const getDataByTahapPelayanan = await detailAntrianModel.getDetailAntrianByIdAntrianAndTahapPelayanan(id, 1);
          if (!getDataByTahapPelayanan) {
            connection.rollback();
            return helper.response(response, 404, { message: 'data detail antrian tidak ditemukan' }, {});
          }
          await detailAntrianModel.putDetailAntrian(getDataByTahapPelayanan.id_detail_antrian, setDataDetailAntrian);

          // return helper.response(response, 200, { message: 'Put data Antrian berhasil' }, result);
        }

        // kasih kondisi ketika pasien masih belum hadir namun tiba gilirannya
        // {}

        // - menunggu pembayaran-menunggu pelayanan (pembayaran) (input dan update waktu selesai pada proses pembayaran)
        if (parseInt(setDataAntrian.status_antrian, 10) === 4) {
          const setDataDetailAntrian = {
            id_antrian: id,
            id_tahap_pelayanan: 2,
            waktu_mulai_pelayanan: getFullTime().toString(),
            waktu_selesai_pelayanan: getFullTime().toString(),
          };
          await detailAntrianModel.postDetailAntrian(setDataDetailAntrian);
        }
        // - menunggu pelayanan- sedang dilayani -> input detail antrian(pelayanan poli mulai)
        if (parseInt(setDataAntrian.status_antrian, 10) === 5) {
          const getPraktek = await praktekModel.getPraktekById(checkData.id_praktek);
          if (getPraktek.jumlah_pelayanan == 0) {
            await connection.rollback();
            return helper.response(response, 204, { message: 'Gagal update status antrian, Poli penuh ' });
          }
          const setDataDetailAntrian = {
            id_antrian: id,
            id_tahap_pelayanan: 3,
            waktu_mulai_pelayanan: getFullTime().toString(),

          };
          await detailAntrianModel.postDetailAntrian(setDataDetailAntrian);

          // update jumlah pelayanan pada praktek dikurangi 1
          await praktekModel.putPraktek(checkData.id_praktek, { jumlah_pelayanan: getPraktek.jumlah_pelayanan - 1 });
        }

        // - sedang dilayani-selesai -> update  waktu_selesai_pelayanan detail antrian(pelayanan poli)
        if (parseInt(setDataAntrian.status_antrian, 10) === 6) {
          const setDataDetailAntrian = {

            waktu_selesai_pelayanan: getFullTime().toString(),

          };
          const getDataByTahapPelayanan = await detailAntrianModel.getDetailAntrianByIdAntrianAndTahapPelayanan(id, 3);

          // update waktu selesai pelayanan pada detail antrian
          await detailAntrianModel.putDetailAntrian(getDataByTahapPelayanan.id_detail_antrian, setDataDetailAntrian);
          // update total_waktu pelayanan di antrian menjadi selisih dari  waktu selesai dan waktu mulai detail antrian
          setDataAntrian.total_waktu_pelayanan = timeToMinute(setDataDetailAntrian.waktu_selesai_pelayanan) - timeToMinute(getDataByTahapPelayanan.waktu_mulai_pelayanan);

          const getDataAntrianByDate = await antrianModel.getAntrianByDateAndPraktek(checkData.tanggal_periksa, checkData.id_praktek);

          // ubah estimasi waktu antrian setelahnya
          const nextQueueList = getDataAntrianByDate.filter((item) => item.urutan > checkData.urutan && item.status_antrian < 6);
          const getPraktek = await praktekModel.getPraktekById(checkData.id_praktek);

          // cek apabila total waktu pelayanan pasien
          // melebihi waktu reata2 pada poli, maka dikurangi dengan rata2 waktu-(total waktu pelayanan- rata2 waktu)
          const different = setDataAntrian.total_waktu_pelayanan > getPraktek.waktu_pelayanan ? getPraktek.waktu_pelayanan - (setDataAntrian.total_waktu_pelayanan - getPraktek.waktu_pelayanan) : getPraktek.waktu_pelayanan;
          if (nextQueueList.length > 0) {
            for (let i = 0; i < nextQueueList.length; i++) {
              console.log(i);
              const res = await antrianModel.putAntrian(nextQueueList[i].id_antrian, { estimasi_waktu_pelayanan: nextQueueList[i].estimasi_waktu_pelayanan - different });
              console.log(res);
            }
          }

          // update kuota antrian pasien menjadi 1
          await pasienModel.putPasien(checkData.nik, { kuota_daftar: 1 });

          // memanggil antrian berikutnya
          // disini codenya

          // update jumlah pelayanan pada praktek
          await praktekModel.putPraktek(checkData.id_praktek, { jumlah_pelayanan: getPraktek.jumlah_pelayanan + 1 });
        }
        if (parseInt(setDataAntrian.status_antrian, 10) === 7) {
          // proses mendapatkan list antrian berikutnya
          const getDataAntrianByDate = await antrianModel.getAntrianByDateAndPraktek(checkData.tanggal_periksa, checkData.id_praktek);
          const getPraktek = await praktekModel.getPraktekById(checkData.id_praktek);
          const nextQueueList = getDataAntrianByDate.filter((item) => item.urutan > checkData.urutan && item.status_antrian < 6);
          if (nextQueueList.length > 0) {
            for (let i = 0; i < nextQueueList.length; i++) {
              // estimasi waktu antrian setelahnya dikurangi waktu-pelayanan per poli pada tabel praktek
              await antrianModel.putAntrian(nextQueueList[i].id_antrian, { estimasi_waktu_pelayanan: nextQueueList[i].estimasi_waktu_pelayanan - getPraktek.waktu_pelayanan });
            }
          }
          // jika membatalkan melalui mobile (pasien) dan h-1 maka kuota daftar pasien kembali 1
          if (new Date(getFullDate(null)) < new Date(checkData.tanggal_periksa) && setData?.sumber == 'Mobile-Pasien') {
            await pasienModel.putPasien(checkData.nik, { kuota_daftar: 1 });
          }
          // jika membatalkan  melalui mobile(pasien) dan hari h maka cek juga jam nya kurang dari setengah 8 pagi(jam operasional) maka kuota daftar pasien kembali 1
          if (new Date(checkData.tanggal_periksa).toLocaleDateString('id') == new Date(getFullDate(null)).toLocaleDateString('id') && getFullTime() < '07:30:00' && setData?.sumber == 'Mobile-Pasien') {
            await pasienModel.putPasien(checkData.nik, { kuota_daftar: 1 });
          }
          // jika membatalkan  melalui mobile (petugas atau pasien) dan hari h maka cek status antrian, apabila masih terdaftar(1) dan juga status antrian adalah 4 (menunggu pelayanan) maka kuota daftar pasien kembali 1

          if (new Date(checkData.tanggal_periksa).toLocaleDateString('id') == new Date(getFullDate(null)).toLocaleDateString('id') && setData?.sumber.includes('Mobile')) {
            if (checkData.status_antrian == 1 || checkData.status_antrian == 4) { await pasienModel.putPasien(checkData.nik, { kuota_daftar: 1 }); }
          }

          // jika membatalkan melalui web admin dan status nya terdaftar / menunggu pelayanan
          if (new Date(checkData.tanggal_periksa).toLocaleDateString('id') == new Date(getFullDate(null)).toLocaleDateString('id') && setData?.sumber.toLowerCase() === 'web') {
            if (checkData.status_antrian == 1 || checkData.status_antrian == 4) { await pasienModel.putPasien(checkData.nik, { kuota_daftar: 1 }); }
          }
          // edit status hadir
          // if (checkData.status_hadir == 0) {
          //   setDataAntrian.status_hadir = 2;
          // }

          // update jumlah pelayanan pada praktek
          await praktekModel.putPraktek(checkData.id_praktek, { jumlah_pelayanan: getPraktek.jumlah_pelayanan + 1 });
        }

        await antrianModel.putAntrian(id, setDataAntrian);
        const result = await antrianModel.getAntrianById(id);

        // post notifikasi tentang status antrian
        const setDataNotif = {
          id_antrian: result.id_antrian,
          text_notifikasi: 'Status antrian ',
          jenis_notifikasi: 1,
          aksi: 0,

          id_antrian_tujuan: null,
          is_opened: '0',

        };
        await notifikasiModel.postNotifikasi(setDataNotif);

        io.emit('server-editAntrian', { result });
        await connection.commit();
        return helper.response(response, 200, { message: 'Put data Antrian berhasil' }, result);
      }

      // ================if update status kehadiran===================
      if (setData.status_hadir) {
        const setDataAntrian = {
          status_hadir: setData.status_hadir,
          waktu_kehadiran: setData.status_hadir == 1 ? moment(Date.now()).format('YYYY-MM-DD HH:MM:ss') : null,
        };
        // apabila setdata dan check data memiliki status_antrian yang sama(tidak berubah) maka tidak dilakukan update
        if (setData.status_hadir == checkData.status_hadir) {
          await connection.rollback();
          return helper.response(response, 401, { message: 'Status kehadiran antrian tidak berubah' });
        }

        // jika tidak hadir / status_hadir = 2, maka antrian dibatalkan
        if (setDataAntrian.status_hadir == 2) {
          setDataAntrian.status_antrian = 7;
        }

        await antrianModel.putAntrian(id, setDataAntrian);
        const result = await antrianModel.getAntrianById(id);
        io.emit('server-editAntrian', { result });
        const newResult = {
          ...result,

        };
        // post notifikasi tentang status kehadiran
        const setDataNotif = {
          id_antrian: result.id_antrian,
          text_notifikasi: 'Status kehadiran antrian',
          jenis_notifikasi: 0,
          aksi: 0,

          id_antrian_tujuan: null,
          is_opened: '0',

        };
        await notifikasiModel.postNotifikasi(setDataNotif);

        // status terdaftar-diproses
        await connection.commit();
        return helper.response(response, 200, { message: 'Put data Antrian berhasil' }, newResult);
      }
    } catch (error) {
      console.log(error);
      await connection.rollback();
      return helper.response(response, 500, { message: 'Put data Antrian gagal' });
    }
  },
  putAntrian: async (request, response) => {
    await connection.beginTransaction();
    try {
      const setData = request.body;
      const { id } = request.params;
      const { io, token } = request;
      console.log('3 nih');

      const checkData = await antrianModel.getAntrianById(id);

      // cek apakah tanggal hari ini sama dengan tanggal periksa/kunjungan
      if (new Date(checkData.tanggal_periksa).toLocaleDateString('id') != new Date(getFullDate(null)).toLocaleDateString('id')) {
        await connection.rollback();
        return helper.response(response, 401, { message: 'Waktu Kunjungan bukan untuk hari ini' });
      }
      // cek apakah hari minggu
      const date = new Date(checkData.tanggal_periksa);
      // cek apakah untuk hari ini
      if (new Date(checkData.tanggal_periksa).toLocaleDateString('id') == new Date(getFullDate(null)).toLocaleDateString('id')) {
        if (getFullTime() >= '07:30:00') {
          // jika hari jumat dan lebih dari jam 10 maka gagal
          if (date.getDay() == 5 && getFullTime() > '11:00:00') {
            await connection.rollback();

            return helper.response(response, 401, { message: 'Proses gagal, melebihi batas waktu pendaftaran' });
          }
          // jika hari sabtu dan lebih dari jam 11 maka gagal
          if (date.getDay() == 6 && getFullTime() > '11:30:00') {
            await connection.rollback();
            return helper.response(response, 401, { message: 'Proses gagal, melebihi batas waktu pendaftaran' });
          }
          // jika di hari senin - kamis dan lebih dari jam 12
          if (date.getDay() < 5 && getFullTime() > '15:00:00') {
            await connection.rollback();
            return helper.response(response, 401, { message: 'Proses gagal, melebihi batas waktu pendaftaran' });
          }
        } else {
          await connection.rollback();
          return helper.response(response, 401, { message: 'Proses gagal,  diluar waktu pendaftaran' });
        }
      }

      const setDataPutAntrian = {

        user_id: setData.user_id,
        id_praktek: setData.id_praktek,
        nik: setData.nik,
        tanggal_periksa: setData.tanggal_periksa?.split('/').reverse().join('-'),
        prioritas: setData.prioritas,
        keluhan: setData.keluhan,
        daftar_dengan_bpjs: setData.daftar_dengan_bpjs,
        estimasi_waktu_pelayanan: 0,
        status_hadir: setData.status_hadir,
        // status_antrian: setData.status_antrian,

        booking: setData.booking,

      };
      const setDataKk = {
        no_kk: setData.no_kk,
        kepala_keluarga: setData.kepala_keluarga,

      };
      const setDataRM = {
        no_rm: setData.no_rm,
        no_kk: setData.no_kk,

      };
      const setDataDetailRM = {
        no_rm: setData.no_rm,
        nik: setData.nik,
        id_rak: setData.id_rak,

      };
      const setDataPasien = {
        nik: setData.nik,
        no_kk: setData.no_kk,
        nama: setData.nama,
        ttl: setData.ttl,
        jenis_kelamin: setData.jenis_kelamin,
        alamat: setData.alamat,
        rt: setData.rt,
        rw: setData.rw,
        kelurahan: setData.kelurahan,
        kecamatan: setData.kecamatan,
        no_telepon: setData.no_telepon,
        bpjs: setData.bpjs,
        nomor_kartu_bpjs: setData.nomor_kartu_bpjs ? setData.nomor_kartu_bpjs : '',
        pekerjaan: setData.pekerjaan,
        kuota_daftar: setData.kuota_daftar || 0,
        url_foto_kartu_identitas: setData.url_foto_kartu_identitas ? setData.url_foto_kartu_identitas : '',
        pendidikan_terakhir: setData.pendidikan_terakhir,
        status_anggota_keluarga: setData.status_anggota_keluarga,
      };
        // cek kuota daftar pada pasien pendaftar
      const checkPasien = await pasienModel.getPasienById(setDataPasien.nik);

      // menghitung estimasi waktu pada pasien yang akan mendaftar.

      // 1. cek data kartu keluarga
      const checkKK = await kartuKeluargaModel.getnoKKByID(setDataKk.no_kk);
      if (!checkKK) {
        await kartuKeluargaModel.postKartuKeluarga(setDataKk);
      } else {
        const putDataKK = {
          ...setDataKk,

        };
        await kartuKeluargaModel.putKartuKeluarga(setDataKk.no_kk, { no_kk: putDataKK.no_kk, kepala_keluarga: putDataKK.kepala_keluarga });
      }
      // 2. cek data pasien
      if (!checkPasien) {
        await pasienModel.postPasien(setDataPasien);
      } else {
        const putDataPasien = {
          ...setDataPasien,
        };
        delete putDataPasien.nik;
        await pasienModel.putPasien(setDataPasien.nik, { ...putDataPasien, kuota_daftar: 0 });
      }
      // 3. cek data RM
      if (setData.no_rm) {
        console.log(setData.no_rm);
        const checkRM = await rekamMedisModel.getRekamMedisById(setData.no_rm);
        console.log(checkRM);

        if (!checkRM) {
          // saat tidak ada data RM dari no RM
          await rekamMedisModel.postRekamMedis(setDataRM);
        } else if (checkRM && checkRM.no_kk !== setData.no_kk) {
          // opsi terbaik adalah melakukan peringatan
          return helper.response(response, 409, { message: 'No. Rekam medis sudah digunakan' }, {});

          // ganti kartu keluarga yang lama dengan no rm=null
          // set no kk pada data rekam medis dengan no_kk saat ini pada body

          // await kartuKeluargaModel.putKartuKeluarga(checkRM.no_kk, { no_rm: null });
          // await rekamMedisModel.putRekamMedis(checkRM.no_rm, { no_kk: setData.no_kk });
        }
        // edit RM di kartu keluarga saat ini pada body
        await kartuKeluargaModel.putKartuKeluarga(setDataKk.no_kk, { no_rm: setData.no_rm });
      }

      const checkNewestKK = await kartuKeluargaModel.getnoKKByID(setDataKk.no_kk);

      // 4. detail rekam medis
      // cek apakah no RM pada data kartu keluarga null
      if (checkNewestKK.no_rm !== null) {
        const checkDetailRM = await detailRekamMedisModel.getDetailRekamMedisByNIK(setData.nik);
        if (!checkDetailRM) {
          console.log('detail rekam medis');
          // input data detail saat tidak ada data berdasarkan NIK di detail RM
          await detailRekamMedisModel.postDetailRekamMedis(setDataDetailRM);
        } else {
          console.log('edit detail rekam medis');
          // apabila ada, maka edit
          await detailRekamMedisModel.putDetailRekamMedis(checkDetailRM.id_detail_rekam_medis, { id_rak: setDataDetailRM.id_rak });
        }
      }
      // 5. antrian
      // console.log(setDataAntrian);
      const result = await antrianModel.putAntrian(id, setDataPutAntrian);
      const newResult = { ...result, ...setDataPutAntrian };

      if (result) {
        io.emit('server-editAntrian', { result });
      }
      await connection.commit();
      return helper.response(response, 200, { message: 'Put data Antrian berhasil' }, result);
    } catch (error) {
      console.log(error);
      await connection.rollback();
      return helper.response(response, 500, { message: 'Put data Antrian gagal' });
    }
  },
  tukarAntrian: async (request, response) => {

  },
  deleteAntrian: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await antrianModel.deleteAntrian(id);
      return helper.response(response, 200, { message: 'Delete data  Antrian berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Delete data Antrian gagal' });
    }
  },
};
