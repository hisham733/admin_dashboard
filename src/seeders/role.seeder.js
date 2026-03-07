const prisma = require('../configs/prisma');

async function seedRoles() {

  const permissions = await prisma.permission.findMany();

  const permissionNames = permissions.map(p => p.name);

  const adminPermissions = permissionNames.filter(
    p => !p.startsWith('role') && !p.startsWith('permission')
  );

  const superAdminPermissions = permissionNames;

  const userPermissions = ['dashboard:view']; 

  await createRoleWithPermissions('admin', adminPermissions);
  await createRoleWithPermissions('super admin', superAdminPermissions);
  await createRoleWithPermissions('user', userPermissions);

}

async function createRoleWithPermissions(roleName, permissionsList) {

  const role = await prisma.role.upsert({
    where: { name: roleName },
    update: {},
    create: {
      name: roleName
    }
  });

  await prisma.role.update({
    where: { id: role.id },
    data: {
      permissions: {
        connect: permissionsList.map(name => ({ name }))
      }
    }
  });
}

module.exports = seedRoles;