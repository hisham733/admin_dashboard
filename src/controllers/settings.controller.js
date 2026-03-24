const fs = require('fs').promises;
const path = require('path');
const settingsService = require('../services/settings.service');
const { can } = require('../utilities');

const publicRoot = path.join(__dirname, '../../public');

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

  const { system_name, primary_color, default_theme, organization_name } = req.body;
  const current = await settingsService.getAll();
  let logo_url = current.logo_url;

  if (req.file) {
    logo_url = `/uploads/logos/${req.file.filename}`;
    const old = current.logo_url;
    if (old && old.startsWith('/uploads/logos/')) {
      const oldAbs = path.join(publicRoot, old.replace(/^\//, ''));
      try {
        await fs.unlink(oldAbs);
      } catch (_) {
        /* ignore missing file */
      }
    }
  }

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
