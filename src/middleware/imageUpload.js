/* eslint-disable no-unused-expressions */
/* eslint-disable no-sequences */
const multer = require('multer');
const path = require('path');
const helper = require('../helpers');

const fileName = '';

const checkFileType = (file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = filetypes.test(file.mimetype);
  console.log(file);
  if (extname && mimeType) {
    return cb(null, true);
  }

  return cb('Upload Image only', false);
};

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './public/image'),
    file;
  },
  filename(req, file, cb) {
    const fileExt = file.originalname.split('.')[1];
    cb(null, `${file.fieldname}-${Date.now()}.${fileExt}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 1000000 }, // 1mb
  fileFilter(req, file, cb) {
    checkFileType(file, cb);
  },
});
const uploadProcess = upload.single('gambar');

const uploadImage = (req, res, next) => {
  uploadProcess(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return helper.response(res, 500, { message: err.message });
    } if (err) {
      return helper.response(res, 500, { message: err.message });
      // An unknown error occurred when uploading.
    }
    console.log(res);
    next();
    // Everything went fine.
  });
};

module.exports = {
  imageUpload: uploadImage,
};
