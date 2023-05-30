// import instaRefreshCron from './crons/instaRefresh.cron';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const cron = require('node-cron');

const https = require('https');
const http = require('http');

const fs = require('fs');
const path = require('path');

const socketIo = require('socket.io');
const serviceAccount = require('./firebase.json');
const { instagramToken } = require('./src/utils/instaRefresh.cron');
const NotificationServiceInstance = require('./src/utils/NotificationService');
const routeNavigator = require('./src/index');
const usersConnected = require('./src/utils/user-connected');
const fcmUsers = require('./src/utils/array-fcm');

const app = express();
require('dotenv').config();

const server = https
  .createServer(
    {
      key: fs.readFileSync('./security/cert.key'),
      cert: fs.readFileSync('./security/cert.pem'),
    },
    app,
  );

const io = socketIo(server, {
  cors: {
    origin: '*',
  },
});

app.use((req, res, next) => {
  req.io = io;
  return next();
});

io.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  socket.on('user-connected', async (userId, token, type) => {
    // socket
    usersConnected[socket.id] = userId;
    // fcm
    // contoh userId=user_id--token ( userId: '3333333333333333--fxHEKWfNQpOktjeF6mi6et:APA91bECAAcrf87ZNfNiAPyj0Uh2MuwB36_99TFuzEf3NNanwRHMqr_CCEh7KSv3OVGpIcMheEkwH1aLT3oSFc0u3Sq8B_zVhZjuUz3yOwSNPqkxqli7e3q02-6Eq6OIZEs6nwW2R7I3',)
    if (type == 'mobile') {
      const indexData = fcmUsers.findIndex((item) => item.userId == `${userId}--${token}`);
      if (indexData !== -1) {
        fcmUsers[indexData] = {
          userId: `${userId}--${token}`,
          token,
        };
      } else {
        fcmUsers.push({
          userId: `${userId}--${token}`,
          token,
        });
      }

      //= =======================================================

      //= ======================================================
      console.log(`userId ${userId}`);
      console.log(usersConnected); // ojIckSD2jqNzOqIrAGzL
      console.log(fcmUsers);
      // await NotificationServiceInstance.publishNotification('halo', 'coba', fcmUsers.map((item) => item.token));
    }
    console.log(usersConnected); // ojIckSD2jqNzOqIrAGzL
  });
  socket.on('client-publishNotification', (type, data) => {
    console.log(data);
    socket.broadcast.emit('server-publishNotification', type, data);
  });

  socket.on('client-logout', (userId, token) => {
    console.log(`disconnect ${userId}`);
    const index = fcmUsers.findIndex((item) => item.userId == `${userId}--${token}`);
    fcmUsers.splice(index, 1);
  });

  socket.on('disconnect', async () => {
    socket.disconnect();
    console.log('🔥: A user disconnected');
    delete usersConnected[socket.id];
    console.log(usersConnected);
    // coba send notif
    // if (fcmUsers.length > 0) { await NotificationServiceInstance.publishNotification('halo', 'coba', fcmUsers.map((item) => item.token)); }
  });

  console.log(usersConnected); // ojIckSD2jqNzOqIrAGzL
});
// const server = app.listen(process.env.PORT, process.env.HOST_LOCAL, () => {
//   const host = server.address().address;
//   const { port } = server.address();

//   console.log(`server running at${host} : ${port}`);
// });

// setting https
server.listen(process.env.PORT, process.env.NODE_ENV === 'production'
  ? process.env.HOST_DEPLOY : process.env.HOST_LOCAL, () => {
  console.log(
    `app running and listening on port ${server.address().port}! Go to https://${process.NODE_ENV === 'production' ? process.env.HOST_DEPLOY : process.env.HOST_LOCAL}:${server.address().port}/`,
  );
});

// refresh instaAccessToken eg: weekly(every Sat)
cron.schedule('* * * * * 7', async () => {
  await instagramToken();
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
