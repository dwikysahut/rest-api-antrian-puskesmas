/* eslint-disable no-return-await */
/* eslint-disable no-plusplus */
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

require('dotenv').config();

module.exports = {
  response: (response, status, { message = 'none' }, data = {}) => {
    const result = {};
    result.status = status || 200;
    result.message = message;
    result.data = data;

    // return untuk memastikan end of function
    return response.status(result.status).json(result);
  },
  nodemailer: (email, subject, template) => {
    const transporter = nodemailer.createTransport({
      service: process.env.SERVICE_MAILER,
      auth: {
        user: process.env.SERVICE_EMAIL,
        pass: process.env.SERVICE_EMAIL_GENERATE_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SERVICE_EMAIL,
      to: email,
      subject,
      html: template,
    };
    return transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        throw (new Error('Gagal mengirimkan email'));
        return false;
      }

      console.log(`Email sent: ${info.response}`);
      return true;
    });
  },
  random: (length) => {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },
  fcmSendNotif: async ({
    admin, tokens, title, body,
  }) => await admin.messaging().sendMulticast({
    tokens,
    notification: {
      title,
      body,

    },
  }),
  hashPassword: (password) => bcrypt.hashSync(password, 6),
  timeToMinute: (time) => {
    const timeArr = time.split(':');
    const dateToMinute = (timeArr[0] * 60) + (timeArr[1]);
    return dateToMinute;
  },
  getFullDate: (data = null) => {
    const date = data ? new Date(data) : new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  },
  getFullTimeByCustom(date) {
    return `${
      date.getHours().toString().length < 2
        ? `0${date.getHours()}`
        : `${date.getHours()}`
    }:${
      date.getMinutes().toString().length < 2
        ? `0${date.getMinutes()}`
        : `${date.getMinutes()}`
    }:${
      date.getSeconds().toString().length < 2
        ? `0${date.getSeconds()}`
        : `${date.getSeconds()}`
    }`;
  },
  getCalculatedTime(minute, time = null) {
    const date = new Date();

    // saat tanggal  sama dengan hari ini
    if (time == null) {
      date.setHours(8, 0, 0);
    } else {
      // saat tanggal tidak sama

      date.setHours(
        time.split(':')[0],
        time.split(':')[1],
        time.split(':')[2],
      );
    }

    return this.getFullTimeByCustom(new Date(date.getTime() + minute * 60000));
  },
  getBeforeDate: (data = null) => {
    const date = data ? new Date(data) : new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  },
  getCustomDate: (type, dateNow) => {
    const date = new Date();
    if (type.includes('before')) {
      date.setDate(new Date(dateNow).getDate() - 1);
    }
    if (type.includes('after')) {
      date.setDate(new Date(dateNow).getDate() + 1);
    }
    return date;
  },
  getFullTime: () => {
    const date = new Date();
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  },
  convertMontName: (month) => {
    switch (month) {
      case 'January':
        return 'Januari';

      case 'February':
        return 'Februari';

      case 'March':
        return 'Maret';

      case 'May':
        return 'Mei';

      case 'June':
        return 'Juni';

      case 'July':
        return 'Juli';

      case 'August':
        return 'Agustus';

      case 'October':
        return 'Oktober';

      case 'December':
        return 'Desember';

      default:
        return month;
    }
  },
};
