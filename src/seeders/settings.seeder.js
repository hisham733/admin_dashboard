const settingsService = require('../services/settings.service');

async function seedSettings() {
  await settingsService.seedDefaults();
  console.log('✓ Settings seeded');
}

module.exports = seedSettings;
