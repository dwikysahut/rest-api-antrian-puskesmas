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
const pasienModel = require('../models/pasien');
const helper = require('../helpers');
const connection = require('../config/connection');

const {
  getFullDate, getFullTime, constTimeToMinute, TimeToMinute, timeToMinute,
} = require('../helpers');

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
      const result = await antrianModel.getAllAntrian();
      return helper.response(response, 200, { message: 'Get All data Antrian berhasil' }, result);
    } catch (error) {
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
      return helper.response(response, 500, { message: 'Get data Antrian gagal' });
    }
  },

  postAntrian: async (request, response) => {
    await connection.beginTransaction();
    try {
      const setData = request.body;

      const { io, token } = request;

      if (new Date(setData.tanggal_periksa.split('/').reverse().join('-')) < new Date(getFullDate(null))) {
        return helper.response(response, 401, { message: 'Tanggal tidak boleh kurang dari hari ini' });
      }

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
        return helper.response(response, 403, { message: 'Pasien telah terdaftar pada antrian ' }, {});
      }
      const getPraktek = await praktekModel.getPraktekById(setData.id_praktek);
      // mendapatkan antrian
      const checkAntrian = await antrianModel.getAntrianByDate(setData.tanggal_periksa.split('/').reverse().join('-'), setData.id_praktek);
      // mendapatkan antrian yang belum selesai / tidak batal
      const checkAntrianKuota = await antrianModel.getAntrianAvailableByDate(setData.tanggal_periksa.split('/').reverse().join('-'), setData.id_praktek);

      // cek kuota antrian di poli tertentu dari praktek
      if (checkAntrian.length >= getPraktek.kuota_booking) {
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
      } else {
      // set urutan dan tiket antrian
        const formattedDate = setData.tanggal_periksa.split('/').reverse().join('-');
        // mendapatkan last urutan di antrian pada taggal dan poli yang dituju
        const lastDataByUrutan = await antrianModel.getAntrianSequentialByDate(formattedDate, setData.id_praktek);
        setData.urutan = lastDataByUrutan.last_number > 0 ? lastDataByUrutan.last_number + 1 : 1;

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
      setData.request_tukar = 1;

      if (setData.tanggal_periksa >= new Date().toLocaleDateString('ID')) setData.booking = 1;
      else setData.booking = 0;
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
        prioritas: setData.prioritas,
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
      // 4. detail rekam medis
      const checkDetailRM = await detailRekamMedisModel.getDetailRekamMedisByNIK(setData.nik);
      if (!checkDetailRM) {
        // input data detail saat tidak ada data berdasarkan NIK di detail RM
        await detailRekamMedisModel.postDetailRekamMedis(setDataDetailRM);
      } else {
        // apabila ada, maka edit
        await detailRekamMedisModel.putDetailRekamMedis(checkDetailRM.id_detail_rekam_medis, { id_rak: setDataDetailRM.id_rak });
      }

      // 5. antrian
      console.log(setDataAntrian);
      const result = await antrianModel.postAntrian(setDataAntrian);

      if (result) {
        io.emit('server-addAntrian', { result });
      }
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

      // console.log('lewat');
      // if update status antrian
      if (setData.status_antrian) {
        const setDataAntrian = {

          status_antrian: setData.status_antrian,

        };

        const checkData = await antrianModel.getAntrianById(id);
        // cek apakah tanggal hari ini sama dengan tanggal periksa/kunjungan
        if (new Date(checkData.tanggal_periksa) !== new Date(getFullDate(null))) {
          return helper.response(response, 401, { message: 'Waktu Kunjungan bukan untuk hari ini' });
        }

        // cek ketersediaan data
        if (!checkData) {
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
          await detailAntrianModel.putDetailAntrian(getDataByTahapPelayanan.id_detail_antrian, setDataDetailAntrian);

          // return helper.response(response, 200, { message: 'Put data Antrian berhasil' }, result);
        }

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
            return helper.response(response, 204, { message: 'Gagal update status antrian, Poli penuh ' });
          }
          const setDataDetailAntrian = {
            id_antrian: id,
            id_tahap_pelayanan: 3,
            waktu_mulai_pelayanan: getFullTime().toString(),

          };
          await detailAntrianModel.postDetailAntrian(setDataDetailAntrian);
          // update jumlah pelayanan pada praktek
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

          const getDataAntrianByDate = await antrianModel.getAntrianByDate(checkData.tanggal_periksa, checkData.id_praktek);

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
          const getDataAntrianByDate = await antrianModel.getAntrianByDate(checkData.tanggal_periksa, checkData.id_praktek);
          const getPraktek = await praktekModel.getPraktekById(checkData.id_praktek);
          const nextQueueList = getDataAntrianByDate.filter((item) => item.urutan > checkData.urutan && item.status_antrian < 6);
          if (nextQueueList.length > 0) {
            for (let i = 0; i < nextQueueList.length; i++) {
              await antrianModel.putAntrian(nextQueueList[i].id_antrian, { estimasi_waktu_pelayanan: nextQueueList[i].estimasi_waktu_pelayanan - getPraktek.waktu_pelayanan });
            }
          }
          // jika melalui mobile dan h-1 maka kuota daftar pasien kembali 1
          if (new Date(getFullDate(null)) < new Date(checkData.tanggal_periksa) && setData?.sumber.toLowerCase() !== 'web') {
            await pasienModel.putPasien(checkData.nik, { kuota_daftar: 1 });
          }
          // jika melalui mobile dan hari h maka cek juga jam nya kurang dari setengah 8 pagi(jam operasional) maka kuota daftar pasien kembali 1

          if (new Date(getFullDate(null)) == new Date(checkData.tanggal_periksa) && getFullTime() < '07:30:00' && setData?.sumber.toLowerCase() !== 'web') {
            await pasienModel.putPasien(checkData.nik, { kuota_daftar: 1 });
          }
        }

        const result = await antrianModel.putAntrian(id, setDataAntrian);
        return helper.response(response, 200, { message: 'Put data Antrian berhasil' }, result);
      }

      // if update status kehadiran
      if (setData.status_hadir) {
        const setDataAntrian = {
          status_hadir: setData.status_hadir,
          waktu_kehadiran: moment(Date.now()).format('YYYY-MM-DD HH:MM:ss'),
        };

        const checkData = await antrianModel.getAntrianById(id);
        if (!checkData) {
          console.log('512');
          return helper.response(response, 404, { message: 'Data Antrian tidak Ditemukan' });
        }

        const result = await antrianModel.putAntrian(id, setDataAntrian);
        const newResult = {
          ...checkData,
          ...setDataAntrian,
        };

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
        status_antrian: setData.status_antrian,
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

      // 4. detail rekam medis
      const checkDetailRM = await detailRekamMedisModel.getDetailRekamMedisByNIK(setData.nik);
      console.log(checkDetailRM);
      if (!checkDetailRM) {
        // input data detail saat tidak ada data berdasarkan NIK di detail RM
        await detailRekamMedisModel.postDetailRekamMedis(setDataDetailRM);
      } else {
        // apabila ada, maka edit
        console.log(setDataDetailRM.id_rak);
        await detailRekamMedisModel.putDetailRekamMedis(checkDetailRM.id_detail_rekam_medis, { id_rak: setDataDetailRM.id_rak });
      }

      // 5. antrian
      // console.log(setDataAntrian);
      const result = await antrianModel.putAntrian(id, setDataPutAntrian);

      if (result) {
        io.emit('server-addAntrian', { result });
      }
      await connection.commit();
      return helper.response(response, 200, { message: 'Put data Antrian berhasil' }, result);
    } catch (error) {
      console.log(error);
      await connection.rollback();
      return helper.response(response, 500, { message: 'Put data Antrian gagal' });
    }
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
