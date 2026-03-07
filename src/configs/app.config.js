require('dotenv').config();

module.exports = {
  app: {
    port: process.env.PORT || 3000,
    url: process.env.URL || 'http://localhost', 
    datbase_url: process.env.DATABASE_URL
  },
  ui: {
    systemName: process.env.SYSTEM_NAME || 'Admin Console',
    logo: process.env.LOGO_URL || null, // URL or path to logo image; null = use default icon
    theme: process.env.UI_THEME || 'light', // 'light' | 'dark' | 'system'
    primaryColor: process.env.PRIMARY_COLOR || '#2563eb' // Blue accent
  }
};