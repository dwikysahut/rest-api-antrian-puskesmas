const axios = require('axios');

module.exports = {
  codeGenerator: () => {
    try {
      axios.get('https://api.instagram.com/oauth/authorize?client_id=1511336122665759&redirect_uri=https://localhost:5000/&scope=user_profile,user_media&response_type=code');
    } catch (error) {

    }
  },
};
