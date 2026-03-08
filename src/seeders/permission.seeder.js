const prisma = require('../configs/prisma');

async function seedPermissions() {

  const models = ['user', 'form', 'role', 'permissions', 'settings'];
  const actions = ['list', 'view', 'create', 'update', 'delete'];

  const permissions = models
    .map(model => actions.map(action => `${model}:${action}`))
    .flat();
 
  permissions.push('dashboard:view');
  permissions.push('form:manage_all');
  permissions.push('form:activate');

  for (const permission of permissions) {

    await prisma.permission.upsert({
      where: { name: permission },
      update: {},
      create: {
        name: permission
      }
    });

  }
}

module.exports = seedPermissions;