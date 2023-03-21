const dokterModel = require('../models/dokter');
const antrianModel = require('../models/antrian');
const informasiModel = require('../models/informasi');
const kartuKeluargaModel = require('../models/kartuKeluarga');
const pasienModel = require('../models/pasien');
const poliModel = require('../models/poli');
const rekamMedisModel = require('../models/rekamMedis');
const usersModel = require('../models/users');
const helper = require('../helpers');

module.exports = {
  getAllDataCount: async (request, response) => {
    try {
      const dataDokter = await dokterModel.getDokterCount();
      const dataAntrian = await antrianModel.getAntrianCount();
      const dataInformasi = await informasiModel.getInformasiCount();
      const dataKartuKeluarga = await kartuKeluargaModel.getKartuKeluargaCount();
      const dataPasien = await pasienModel.getPasienCount();
      const dataPoli = await poliModel.getPoliCount();
      const dataRekamMedis = await rekamMedisModel.getRekamMedisCount();
      const dataUsers = await usersModel.getUsersCount();

      const result = {
        jumlah_dokter: dataDokter.jumlah_dokter,
        jumlah_pendaftaran_antrian: dataAntrian.jumlah_antrian,
        jumlah_informasi: dataInformasi.jumlah_informasi,
        jumlah_kartu_keluarga: dataKartuKeluarga.jumlah_kartu_keluarga,
        jumlah_pasien: dataPasien.jumlah_pasien,
        jumlah_poli: dataPoli.jumlah_poli,
        jumlah_rekam_medis: dataRekamMedis.jumlah_rekam_medis,
        jumlah_pengguna: dataUsers.jumlah_users,
      };
      return helper.response(response, 200, { message: 'Get All data Count berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Get all data count gagal' });
    }
  },
  getAntrianByMonth: async (request, response) => {
    try {
      const result = await antrianModel.getAntrianByMonth();
      const newResult = result.map((item) => ({ ...item, month: `${helper.convertMontName(item.month)} / ${item.year}` }));

      return helper.response(response, 200, { message: 'Get All data antrian by month berhasil' }, newResult);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Get All data antrian by month gagal' });
    }
  },

};
