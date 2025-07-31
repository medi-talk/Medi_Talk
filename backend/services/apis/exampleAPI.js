const axios = require('axios');

module.exports = {
  search: async (query) => {
    const response = await axios.get('https://api.example.com/search', {
      params: { q: query },
      headers: {
        'Authorization': `Bearer ${process.env.API_KEY}`,
      },
    });
    return response.data;
  }
};

