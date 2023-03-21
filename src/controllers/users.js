/* eslint-disable radix */
const generator = require('generate-password');
const bcrypt = require('bcrypt');
const helper = require('../helpers');
const usersModel = require('../models/users');
const authModel = require('../models/auth');
const kartuKeluargaModel = require('../models/kartuKeluarga');

module.exports = {
  getAllUsers: async (request, response) => {
    try {
      const result = await usersModel.getAllUsers();
      const newResult = result.map((item) => ({
        user_id: item.user_id,
        no_kk: item.no_kk,
        nama_user: item.nama_user,
        email: item.email,
        verif_email: item.verif_email,
        verif_akun: item.verif_akun,
        role: item.role,
        no_telepon: item.no_telepon,
        jenis_kelamin: item.jenis_kelamin,
        tanggal_lahir: item.tanggal_lahir,
        kepala_keluarga: item.kepala_keluarga,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      helper.response(response, 200, { message: 'Get All Users Berhasil' }, newResult);
    } catch (error) {
      console.log(error);
      helper.response(response, 500, { message: 'Get All Users Gagal' });
    }
  },
  getUserById: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await usersModel.getUserById(id);
      if (!result) {
        return helper.response(response, 404, { message: 'Data User tidak Ditemukan' });
      }
      return helper.response(response, 200, { message: 'Get data User berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get data User gagal' });
    }
  },
  getUserProfile: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await usersModel.getUserProfileByNIK(id);

      if (!result) {
        return helper.response(response, 404, { message: 'Data User tidak Ditemukan' });
      }
      return helper.response(response, 200, { message: 'Get data User berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get data User gagal' });
    }
  },

  postUser: async (request, response) => {
    try {
      const setData = request.body;
      const setDataUsers = {
        user_id: setData.user_id,
        nama_user: setData.nama_user,
        no_kk: setData.no_kk ? setData.no_kk : null,
        email: setData.email,
        verif_email: setData.verif_email,
        verif_akun: 1,
        role: setData.role,
        no_telepon: setData.no_telepon,
        jenis_kelamin: setData.jenis_kelamin,
        tanggal_lahir: setData.tanggal_lahir.split('/').reverse().join('-'),

      };
      const setDataKK = {
        no_kk: setData.no_kk,
        kepala_keluarga: setData.kepala_keluarga,

      };
      const nikChecked = await authModel.getUserByNIK(setDataUsers.user_id);

      if (nikChecked) {
        return helper.response(response, 409, { message: 'NIK sudah terdaftar pada akun' });
      }

      if (setData.no_kk) {
      // cek nomor kk
        const isKKAvailable = await kartuKeluargaModel.getnoKKByID(setDataKK.no_kk);
        // console.log(`kk${isKKAvailable}`);

        if (!isKKAvailable) {
          await kartuKeluargaModel.postKartuKeluarga(setDataKK);
        } else {
          await kartuKeluargaModel.putKartuKeluarga(
            setDataKK.no_kk,
            { kepala_keluarga: setDataKK.kepala_keluarga },
          );
        }
      }
      const emailChecked = await authModel.getUserByEmail(setData.email);
      if (emailChecked) {
        return helper.response(response, 409, { message: 'Email sudah digunakan, gunakan email lain' });
      }
      const password = generator.generate({
        length: 10,
        numbers: true,
      });
      const passwordHash = bcrypt.hashSync(password, 6);

      setDataUsers.password = passwordHash;
      const randomCode = helper.random(6);
      if (parseInt(setData.verif_email) == 0) {
        const randomCodeHash = bcrypt.hashSync(randomCode, 6);
        setDataUsers.kode_verifikasi_email = randomCodeHash;
        const htmlTemplate = `<center><h2>Kode Verifikasi : </h2><hr><h4>code : ${randomCode}</h4></br>
        <h2>Password anda : </h2><hr><h4>password : ${password}</h4></center>`;
        await helper.nodemailer(setDataUsers.email, 'Password dan Kode verifikasi', htmlTemplate);
      } else {
        const htmlTemplate = `<center>
    <h2>Password anda : </h2><hr><h4>password : ${password}</h4></center>`;
        await helper.nodemailer(setDataUsers.email, 'Password Anda', htmlTemplate);
      }

      const result = await usersModel.postUser(setDataUsers);
      return helper.response(response, 201, { message: 'Input data User berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Input data User gagal' });
    }
  },

  putUser: async (request, response) => {
    try {
      const setData = request.body;

      const { id } = request.params;
      const checkData = await usersModel.getUserById(id);
      if (!checkData) {
        return helper.response(response, 404, { message: 'Data User tidak Ditemukan' });
      }

      if (setData.password) {
        const newPasswordHash = bcrypt.hashSync(setData.password, 6);
        setData.password = newPasswordHash;
        // console.log(setData.password);
      }
      if (setData.tanggal_lahir) {
        setData.tanggal_lahir = setData.tanggal_lahir.split('/').reverse().join('-');
      }
      if (setData.no_kk) {
        const noKKChecked = await kartuKeluargaModel.getnoKKByID(setData.no_kk);
        const setDataKK = {
          no_kk: setData.no_kk,
          kepala_keluarga: setData.kepala_keluarga ? setData.kepala_keluarga : null,
        };
        if (!noKKChecked) {
          await kartuKeluargaModel.postKartuKeluarga(setDataKK);
          console.log('input kk');
        }
        delete setData.no_kk;
        delete setData.kepala_keluarga;
      }

      const result = await usersModel.putUser(id, setData);

      return helper.response(response, 200, { message: 'Ubah data User berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Ubah data User gagal' });
    }
  },
  putUserProfile: async (request, response) => {
    try {
      const setData = request.body;

      const { id } = request.params;
      const checkData = await usersModel.getUserById(id);
      if (!checkData) {
        return helper.response(response, 404, { message: 'Data User tidak Ditemukan' });
      }

      if (setData.password) {
        const newPasswordHash = bcrypt.hashSync(setData.password, 6);
        setData.password = newPasswordHash;
        // console.log(setData.password);
      }
      if (setData.tanggal_lahir) {
        setData.tanggal_lahir = setData.tanggal_lahir.split('/').reverse().join('-');
      }
      if (setData.no_kk) {
        const noKKChecked = await kartuKeluargaModel.getnoKKByID(setData.no_kk);
        const setDataKK = {
          no_kk: setData.no_kk,
          kepala_keluarga: setData.kepala_keluarga ? setData.kepala_keluarga : null,
        };
        if (!noKKChecked) {
          await kartuKeluargaModel.postKartuKeluarga(setDataKK);
          console.log('input kk');
        }
        delete setData.no_kk;
        delete setData.kepala_keluarga;
      }

      await usersModel.putUser(id, setData);
      const newResult = await usersModel.getUserProfileByNIK(id);
      delete newResult.verif_akun;
      delete newResult.verif_email;
      delete newResult.kode_verifikasi_email;
      delete newResult.id_socket;
      delete newResult.password;

      return helper.response(response, 200, { message: 'Ubah data User berhasil' }, newResult);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Ubah data User gagal' });
    }
  },
  deleteUser: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await usersModel.deleteUser(id);
      return helper.response(response, 200, { message: 'Delete data User berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: `Delete data User gagal, ${error.message}` });
    }
  },
};
