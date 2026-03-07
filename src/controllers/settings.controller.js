const settingsService = require('../services/settings.service');
const { can } = require('../utilities');

async function index(req, res) {
  can(req.session.user, 'settings:list');

  const settings = await settingsService.getAll();

  res.render('layouts/main', {
    contentPartial: 'settings/index',
    contentData: { settings },
    activeSection: 'settings',
    title: 'System Settings'
  });
}

async function update(req, res) {
  can(req.session.user, 'settings:update');

  const { system_name, logo_url, primary_color, default_theme, organization_name } = req.body;

  try {
    await settingsService.updateMany({
      system_name,
      logo_url,
      primary_color,
      default_theme,
      organization_name
    });
    res.redirect('/settings');
  } catch (err) {
    const settings = await settingsService.getAll();
    res.render('layouts/main', {
      contentPartial: 'settings/index',
      contentData: { settings, error: err.message },
      activeSection: 'settings',
      title: 'System Settings'
    });
  }
}

module.exports = {
  index,
  update
};
