const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const https = require('https');
const http = require('https');
const fs = require('fs');
const path = require('path');

const routeNavigator = require('./src/index');

const app = express();
require('dotenv').config();

// const server = app.listen(process.env.PORT, process.env.HOST_LOCAL, () => {
//   const host = server.address().address;
//   const { port } = server.address();

//   console.log(`server running at${host} : ${port}`);
// });

// setting https
https
  .createServer(
    {
      key: fs.readFileSync(path.resolve('./src/utils/ssl/key.pem')),
      cert: fs.readFileSync(path.resolve('./src/utils/ssl/cert.pem')),
    },
    app,
  )
  .listen(process.env.PORT, process.env.NODE_ENV === 'production'
    ? process.env.HOST_DEPLOY : process.env.HOST_LOCAL, () => {
    console.log(
      `Example app listening on port ${process.env.PORT}! Go to https://localhost:${process.env.PORT}/`,
    );
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public', express.static(`${__dirname}/public`));
app.use(morgan('dev'));
app.use(cors({
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
  credentials: 'true',
  optionSuccessStatus: 200,

}));

app.use('/', routeNavigator);
module.exports = app;
