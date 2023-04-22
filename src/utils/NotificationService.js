/* eslint-disable class-methods-use-this */
const admin = require('firebase-admin');

const serviceAccount = require('../../firebase.json');

class NotificationService {
  constructor() {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    this.isInitialize = true;
  }

  async publishNotification(title, body, tokens) {
    try {
      await admin.messaging().sendMulticast({
        tokens,
        notification: {
          title,
          body,

        },
      });
    } catch (error) {
      console.log(error);
    }
  }
}
// const NotificationServiceInstance = Object.freeze(new NotificationService());
module.exports = new NotificationService();
