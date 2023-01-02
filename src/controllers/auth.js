/* eslint-disable radix */
/* eslint-disable camelcase */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
const generator = require('generate-password');
const authModel = require('../models/auth');
const kartuKeluargaModel = require('../models/kartuKeluarga');
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
      // cek nomor kk
      const isKKAvailable = await kartuKeluargaModel.getnoKKByID(setDataKK.no_kk);
      // console.log(`kk${isKKAvailable}`);

      if (!isKKAvailable) {
        await kartuKeluargaModel.postKartuKeluarga(setDataKK);
      }
      const emailChecked = await authModel.getUserByEmail(setData.email);
      if (emailChecked) {
        return helper.response(response, 409, { message: 'Email sudah digunakan, gunakan email lain' });
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

      return helper.response(response, 201, { message: 'Akun Berhasil Dibuat' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Pendaftaran Akun Gagal' }, error);
    }
  },
  login: async (request, response) => {
    try {
      const { user_id, password } = request.body;

      const userByNIK = await authModel.getUserByNIK(user_id);
      if (!userByNIK) { return helper.response(response, 401, { message: 'Username salah' }); }

      if (parseInt(userByNIK.verif_email) === 0) return helper.response(response, 401, { message: 'Email belum diverifikasi, silahkan melakukan verifikasi email' });
      if (parseInt(userByNIK.verif_akun) === 0) return helper.response(response, 401, { message: 'Akun belum diverifikasi, silahkan menunggu verifikasi akun' });

      const comparePass = bcrypt.compareSync(password, userByNIK.password);
      if (!comparePass) return helper.response(response, 401, { message: 'Password salah' });

      delete userByNIK.password;

      const token = jwt.sign({ userByNIK }, process.env.SECRET_KEY, { expiresIn: '6d' });
      const refreshToken = jwt.sign({ userByNIK }, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: '14d' });

      const resultData = {
        ...userByNIK,
        token,
        refreshToken,
      };
      refreshTokens.push(refreshToken);

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
        return helper.response(response, 409, { message: 'Akun sudah diverifikasi' });
      }
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
      const { user_id } = request.body;
      const result = await authModel.verifyUserAccount(user_id);
      return helper.response(response, 200, { message: 'verifikasi akun berhasil', result });
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
        return helper.response(response, 403, { message: 'refresh token gagal, silahkan login kembail' });
      }

      const result = await authModel.refreshToken(refreshToken);
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

      return helper.response(response, 200, { message: 'refresh token berhasil' }, { newResult });
    } catch (error) {
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
