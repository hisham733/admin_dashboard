require('dotenv').config();

module.exports = {
  app: {
    port: process.env.APP_PORT || 3000,
    url: process.env.URL || 'http://localhost', 
    database_url: process.env.DATABASE_URL,
    env: process.env.ENV
  },
  ui: {
    systemName: process.env.SYSTEM_NAME || 'Admin Console',
    logo: process.env.LOGO_URL || null, 
    theme: process.env.UI_THEME || 'light',
    primaryColor: process.env.PRIMARY_COLOR || '#2563eb' // Blue accent
  }
};