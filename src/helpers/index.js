/* eslint-disable no-plusplus */
const nodemailer = require('nodemailer');

require('dotenv').config();

module.exports = {
  response: (response, status, { message = 'none' }, data = {}) => {
    const result = {};
    result.status = status || 200;
    result.message = message;
    result.data = data;

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
        console.log(error);
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
};
