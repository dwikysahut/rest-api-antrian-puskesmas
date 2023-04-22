/* eslint-disable radix */
/* eslint-disable camelcase */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
const generator = require('generate-password');
const authModel = require('../models/auth');
const kartuKeluargaModel = require('../models/kartuKeluarga');
const usersModel = require('../models/users');
const helper = require('../helpers');
require('dotenv').config();

let refreshTokens = [];

module.exports = {
  createAccount: async (request, response) => {
    try {
      const setData = request.body;
      const setDataUsers = {
        user_id: setData.user_id,
        nama_user: setData.nama_user,
        email: setData.email,
        verif_email: 0,
        verif_akun: 0,
        role: 3,
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
      const emailChecked = await authModel.getUserByEmail(setData.email);
      if (emailChecked) {
        return helper.response(response, 409, { message: 'Email sudah digunakan, gunakan email lain' });
      }

      // cek nomor kk
      const isKKAvailable = await kartuKeluargaModel.getnoKKByID(setDataKK.no_kk);
      // console.log(`kk${isKKAvailable}`);

      if (!isKKAvailable) {
        await kartuKeluargaModel.postKartuKeluarga(setDataKK);
      }

      const hashPassword = bcrypt.hashSync(setData.password, 6);
      const randomCode = helper.random(6);
      const hashRandomCode = bcrypt.hashSync(randomCode, 6);
      setDataUsers.password = hashPassword;
      setDataUsers.kode_verifikasi_email = hashRandomCode;
      setDataUsers.no_kk = isKKAvailable !== undefined ? isKKAvailable.no_kk : setDataKK.no_kk;

      // const result = 'ss';

      // kirim kode verifikasi
      const htmlTemplate = `<center><h2>Kode Verifikasi : </h2><hr><h4>code : ${randomCode}</h4></center>`;
      const emailSending = await helper.nodemailer(setDataUsers.email, 'Kode Verifikasi', htmlTemplate);

      const result = await authModel.createAccount(setDataUsers);

      return helper.response(response, 201, { message: 'Pembuatan Akun Berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Pendaftaran Akun Gagal' }, error);
    }
  },
  login: async (request, response) => {
    try {
      const { user_id, password, type } = request.body;

      const userByNIK = await authModel.getUserByNIK(user_id);
      if (!userByNIK) { return helper.response(response, 401, { message: 'User ID salah' }); }

      const comparePass = bcrypt.compareSync(password, userByNIK.password);
      if (!comparePass) return helper.response(response, 401, { message: 'Password salah' });
      // mengecek apakah akun user (pasien) login di perangkat web (admin)
      if (type === 'web' && userByNIK.role > 2) {
        return helper.response(response, 401, { message: 'Login gagal, Tidak memiliki akses' });
      }

      // cek  verifikasi email
      if (parseInt(userByNIK.verif_email) === 0) return helper.response(response, 401, { message: 'Email belum diverifikasi, silahkan melakukan verifikasi email' });
      // cek verifikasi akun
      if (parseInt(userByNIK.verif_akun) === 0) return helper.response(response, 401, { message: 'Akun belum diverifikasi oleh Admin, silahkan menunggu verifikasi akun' });

      delete userByNIK.password;

      const token = jwt.sign({ result: userByNIK }, process.env.SECRET_KEY, { expiresIn: '6d' });
      const refreshToken = jwt.sign({ result: userByNIK }, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: '14d' });

      const resultData = {
        ...userByNIK,
        token,
        refreshToken,
      };
      delete resultData.created_at;
      delete resultData.updated_at;
      refreshTokens.push(refreshToken);
      delete resultData.verif_akun;
      delete resultData.verif_email;

      return helper.response(response, 200, { message: 'Login Berhasil' }, resultData);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Login gagal' }, error);
    }
  },

  forgotPassword: async (request, response) => {
    try {
      const { email } = request.body;
      const accountWithEmail = await authModel.getUserByEmail(email);
      // ketika email belum terdaftar
      if (!accountWithEmail) {
        return helper.response(response, 403, { message: 'Email belum terdaftar' });
      }
      const newPassword = generator.generate({
        length: 10,
        numbers: true,
      });
      const newPasswordHash = bcrypt.hashSync(newPassword, 6);

      const htmlTemplate = `<center><h2>Here's your new password</h2><hr>new password : <h4>${
        newPassword
      }</h4></center>`;
      await helper.nodemailer(email, 'Password recovery Akun Puskesmas Anda', htmlTemplate);

      const result = await authModel.forgotPassword(accountWithEmail.user_id, newPasswordHash);

      return helper.response(response, 200, { message: 'Password Baru Telah Dikirim ke Email Anda' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Pembuatan Password Baru Gagal' });
    }
  },
  verifyUserEmail: async (request, response) => {
    try {
      const { kode_verifikasi_email, user_id } = request.body;

      const userWithNIK = await authModel.getUserByNIK(user_id);
      if (!userWithNIK) {
        return helper.response(response, 404, { message: `Akun dengan user id ${user_id} tidak ditekan` });
      }
      if (parseInt(userWithNIK.verif_email) === 1) {
        return helper.response(response, 409, { message: 'Email pada akun telah terverifikasi' });
      }
      // melakukan pengecekan kode verifikasi yang dimasukkan user dengan kode pada database
      const compare = bcrypt.compareSync(kode_verifikasi_email, userWithNIK.kode_verifikasi_email);
      if (!compare) {
        return helper.response(response, 401, { message: 'Kode verifikasi salah' });
      }

      const result = await authModel.verifyUserEmail(user_id);
      return helper.response(response, 200, { message: 'Verifikasi email berhasil', result });
    } catch (error) {
      console.log(error);

      return helper.response(response, 500, { message: 'Verifikasi email gagal' });
    }
  },
  verifyUser: async (request, response) => {
    try {
      const setData = request.body;

      const checkData = await authModel.getUserByNIK(setData.user_id);
      console.log(checkData);
      if (!checkData) {
        return helper.response(response, 404, { message: 'User tidak ditemukan' }, {});
      }
      if (setData.verif_akun == 1) {
        const result = await authModel.verifyUserAccount(setData.user_id);
        const htmlTemplate = `<center><h2>Status Verifikasi Akun</h2><hr><h4>
        SELAMAT.... akun anda telah <bold>DISETUJUI</bold>, silahkan login melalui aplikasi...  
        </h4></center>`;
        await helper.nodemailer(checkData.email, 'Status Verifikasi Akun EQ Antrian', htmlTemplate);

        return helper.response(response, 200, { message: 'verifikasi akun berhasil', result });
      }
      // menghapus data user dari database
      const result = await usersModel.deleteUser(setData.user_id);
      // mengirim notifikasi melalui email
      const htmlTemplate = `<center><h2>Status Verifikasi Akun</h2><hr><h4>
      MOHON MAAF :(, Sayangnya, akun anda telah <bold>DITOLAK</bold>, silahkan melakukan pendaftaran kembali  
      </h4></center>`;
      await helper.nodemailer(checkData.email, 'Status Verifikasi Akun Anda', htmlTemplate);

      return helper.response(response, 200, { message: 'Verifikasi Akun ditolak, Akun berhasil dihapus', result });
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Verifikasi akun gagal' });
    }
  },
  refreshToken: async (request, response) => {
    try {
      const { refreshToken } = request.body;

      const isTokenAvailable = refreshTokens.includes(refreshToken);
      if (!isTokenAvailable) {
        return helper.response(response, 401, { message: 'refresh token gagal, silahkan login kembali' });
      }

      const result = await authModel.refreshToken(refreshToken);
      console.log(isTokenAvailable);
      if (!result) {
        return helper.response(response, 401, { message: 'Akun tidak ditemukan' });
      }

      const newToken = jwt.sign({ result }, process.env.SECRET_KEY, { expiresIn: '14d' });
      const newRefreshToken = jwt.sign({ result }, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: '18d' });

      const newResult = {
        token: newToken,
        refreshToken: newRefreshToken,
      };
      const newRefreshTokens = refreshTokens.filter((item) => item !== refreshToken);
      refreshTokens = newRefreshTokens;
      newRefreshTokens.push(newResult.refreshToken);

      return helper.response(response, 200, { message: 'refresh token berhasil' }, { ...newResult });
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'refresh token error' });
    }
  },
  deleteToken: async (request, response) => {
    try {
      const { refreshToken } = request.body;
      const newRefreshTokens = refreshTokens.filter((item) => item !== refreshToken);
      refreshTokens = newRefreshTokens;
      return helper.response(response, 200, { message: 'logout berhasil' });
    } catch (error) {
      return helper.response(response, 500, { message: 'logout gagal' });
    }
  },
};
