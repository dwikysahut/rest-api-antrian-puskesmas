/* eslint-disable max-len */
const informasiModel = require('../models/informasi');
const helper = require('../helpers');

module.exports = {
  getAllInformasi: async (request, response) => {
    try {
      const result = await informasiModel.getAllInformasi();
      return helper.response(response, 200, { message: 'Get All data Informasi berhasil' }, result);
    } catch (error) {
      return helper.response(response, 500, { message: 'Get All data Informasi gagal' });
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
      return helper.response(response, 500, { message: 'Put data Informasi gagal' });
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
};
