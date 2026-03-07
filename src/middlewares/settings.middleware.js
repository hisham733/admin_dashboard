const settingsService = require('../services/settings.service');
const appConfig = require('../configs/app.config');

async function loadSettings(req, res, next) {
  try {
    const settings = await settingsService.getAll();
    res.locals.ui = {
      systemName: (settings.system_name && settings.system_name.trim()) || appConfig.ui.systemName,
      logo: (settings.logo_url && settings.logo_url.trim()) ? settings.logo_url.trim() : null,
      primaryColor: (settings.primary_color && settings.primary_color.trim()) || appConfig.ui.primaryColor,
      theme: settings.default_theme || appConfig.ui.theme,
      organizationName: (settings.organization_name && settings.organization_name.trim()) || settings.system_name || appConfig.ui.systemName
    };
  } catch (err) {
    res.locals.ui = appConfig.ui;
  }
  next();
}

module.exports = loadSettings;
