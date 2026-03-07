const prisma = require('../configs/prisma');
const VALIDATION_ERROR = require('../errors/validation.error');

const DEFAULTS = {
  system_name: 'Admin Console',
  logo_url: '',
  primary_color: '#2563eb',
  default_theme: 'light',
  organization_name: 'Admin Console'
};

async function getAll() {
  const rows = await prisma.systemSetting.findMany();
  const map = {};
  rows.forEach(r => { map[r.key] = r.value; });
  return {
    system_name: map.system_name ?? DEFAULTS.system_name,
    logo_url: map.logo_url ?? DEFAULTS.logo_url,
    primary_color: map.primary_color ?? DEFAULTS.primary_color,
    default_theme: map.default_theme ?? DEFAULTS.default_theme,
    organization_name: map.organization_name ?? DEFAULTS.organization_name
  };
}

async function get(key) {
  const row = await prisma.systemSetting.findUnique({
    where: { key }
  });
  return row?.value ?? DEFAULTS[key];
}

async function set(key, value) {
  if (!Object.keys(DEFAULTS).includes(key)) {
    throw new VALIDATION_ERROR(`Invalid setting key: ${key}`);
  }
  return prisma.systemSetting.upsert({
    where: { key },
    update: { value: String(value ?? '') },
    create: { key, value: String(value ?? '') }
  });
}

async function updateMany(data) {
  const keys = Object.keys(DEFAULTS);
  for (const key of keys) {
    if (data[key] !== undefined) {
      await set(key, data[key]);
    }
  }
  return getAll();
}

async function seedDefaults() {
  for (const [key, value] of Object.entries(DEFAULTS)) {
    await prisma.systemSetting.upsert({
      where: { key },
      update: {},
      create: { key, value: String(value) }
    });
  }
  return getAll();
}

module.exports = {
  getAll,
  get,
  set,
  updateMany,
  seedDefaults,
  DEFAULTS
};
