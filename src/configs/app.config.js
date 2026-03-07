require('dotenv').config();

module.exports = {
  app: {
    port: process.env.PORT || 3000,
    url: process.env.URL || 'http://localhost', 
    datbase_url: process.env.DATABASE_URL
  }
};