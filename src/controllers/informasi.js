/* eslint-disable camelcase */
/* eslint-disable max-len */
const req = require('request');
const axios = require('axios');
const informasiModel = require('../models/informasi');
const helper = require('../helpers');
const constant = require('../utils/constant');
require('dotenv').config();

// let access_token = '';
module.exports = {
  getAllInformasi: async (request, response) => {
    try {
      const resultFirst = await informasiModel.getAllInformasi();
      const resultSecond = await informasiModel.getFromInstagram(constant.token);
      const newResultSecond = resultSecond.map((item) => ({
        id_informasi: item.id, judul_informasi: null, isi_informasi: item.caption, gambar: item.media_url, created_at: item.timestamp,
      }));
      const combineResult = [
        ...resultFirst,
        ...newResultSecond,
      ];
      return helper.response(response, 200, { message: 'Get All data Informasi berhasil' }, combineResult);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: `Get All data Informasi gagal, ${error?.message}` });
    }
  },
  getAllInformasiFromDB: async (request, response) => {
    try {
      const result = await informasiModel.getAllInformasi();

      return helper.response(response, 200, { message: 'Get data Informasi dari database berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: `Get All data Informasi dari database gagal, ${error?.message}` });
    }
  },
  getAllInformasiFromInstagram: async (request, response) => {
    try {
      const result = await informasiModel.getFromInstagram(constant.token);
      const resultFormatted = result.map((item) => ({
        id_informasi: item.id, judul_informasi: null, isi_informasi: item.caption, gambar: item.media_url, created_at: item.timestamp,
      }));
      return helper.response(response, 200, { message: 'Get All data Informasi dari instagram berhasil' }, resultFormatted);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Get All data Informasi dari instagram gagal' });
    }
  },
  getInformasiById: async (request, response) => {
    try {
      const { id } = request.params;
      const result = await informasiModel.getInformasiById(id);
      if (!result) {
        return helper.response(response, 404, { message: 'Data Informasi tidak Ditemukan' });
      }
      return helper.response(response, 200, { message: 'Get data Informasi berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get data Informasi gagal' });
    }
  },

  postInformasi: async (request, response) => {
    try {
      const setData = request.body;
      setData.gambar = request.file?.filename ? request.file.filename : null;

      const result = await informasiModel.postInformasi(setData);
      return helper.response(response, 201, { message: 'Post data Informasi berhasil' }, result);
    } catch (error) {
      console.log(error);
      return helper.response(response, 500, { message: 'Post data Informasi gagal' });
    }
  },
  putInformasi: async (request, response) => {
    try {
      const setData = request.body;
      const { id } = request.params;
      const checkData = await informasiModel.getInformasiById(id);

      if (!checkData) {
        try {
          if (request.file) {
            await informasiModel.deleteImage(request.file.filename);
          }
        } catch (error) {
          console.log('no image found');
        }
        return helper.response(response, 404, { message: 'Data Informasi tidak Ditemukan' });
      }
      if (request.file) {
        if (request.file.filename === 'undefined') {
          console.log('gambar undefined');
        } else {
          setData.gambar = request.file.filename;
          try {
            if (checkData.gambar) {
              await informasiModel.deleteImage(checkData.gambar);
            }
          } catch (error) {
            console.log('no image found');
          }
        }
      }

      const result = await informasiModel.putInformasi(id, setData);
      return helper.response(response, 200, { message: 'Put data Informasi berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Put data Informasi gagal' });
    }
  },
  deleteInformasi: async (request, response) => {
    try {
      const { id } = request.params;
      const checkData = await informasiModel.getInformasiById(id);

      if (checkData.gambar) {
        try {
          await informasiModel.deleteImage(checkData.gambar);
        } catch (error) {
          console.log('no image found');
        }
      }
      const result = await informasiModel.deleteInformasi(id);

      console.log(result);
      return helper.response(response, 200, { message: 'Delete data Informasi berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Delete data Informasi gagal' });
    }
  },
  generateToken: async (request, response) => {
    try {
      const { code } = request.query;
      const { redirect_uri } = constant;
      console.log(code);
      // console.log(redirect_uri);

      // mendapatkan token short life time
      // let resultToken;
      // try {
      const resultToken = await axios.post(
        'https://api.instagram.com/oauth/access_token',
        {
          client_id: process.env.INSTA_CLIENT_ID,
          client_secret: process.env.INSTA_APP_SECRET,
          grant_type: 'authorization_code',
          redirect_uri,
          code,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
        },
      );
      // } catch (error) {
      //   helper.response(response, 500, { message: 'Error to get short life time token' }, { error });
      // }

      console.log(`ss${resultToken.data.access_token}`);
      // mendapatkan token long life time
      // access_token = JSON.parse(resultToken);
      try {
        const resp = await axios.get(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTA_APP_SECRET}&access_token=${resultToken.data.access_token}`);
        constant.token = resp.data.access_token;
      } catch (error) {
        helper.response(response, 500, { message: 'Error to get long life time token' }, {});
      }

      helper.response(response, 200, { message: 'Generate token berhasil' }, {});
    } catch (error) {
      console.log(error);
      helper.response(response, 500, { message: 'Generate token gagal' }, error);
    }
  },
};
