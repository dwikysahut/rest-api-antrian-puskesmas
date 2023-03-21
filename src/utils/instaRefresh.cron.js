const axios = require('axios');
const constant = require('./constant');

module.exports = {
  instagramToken: async () => {
    try {
      if (constant.token !== '') {
        const oldAccessToken = constant.token; // get from DB
        const resp = await axios.get(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${oldAccessToken}`);
        if (resp.data.access_token) {
          const newAccessToken = resp.data.access_token;
          constant.token = newAccessToken;
        }
      }
    } catch (e) {
      console.log('Error=====', e.response.data);
    }
  },
};
