const prisma = require('../configs/prisma');
const { buildQuery, normalizeQuery } = require('../utilities');
const VALIDATION_ERROR = require('../errors/validation.error');

/**
 * For any resource that has a `:list` permission in the DB, disallow selecting
 * other actions (view, create, …) without also selecting `resource:list`.
 * Matching is by resource prefix only: `user:view` requires `user:list`, not `role:list`.
 */
async function assertListBeforeOtherPermissions(permissionIds) {
  if (!Array.isArray(permissionIds) || permissionIds.length === 0) return;

  const ids = [...new Set(permissionIds.map(id => Number(id)).filter(n => !Number.isNaN(n)))];
  const selected = await prisma.permission.findMany({ where: { id: { in: ids } } });
  const selectedNames = new Set(selected.map(p => p.name));

  const listPerms = await prisma.permission.findMany({
    where: { name: { endsWith: ':list' } }
  });
  const resourcesWithList = new Set(listPerms.map(p => p.name.split(':')[0]));

  for (const p of selected) {
    const parts = p.name.split(':');
    const resource = parts[0];
    const action = parts[1];
    if (!action || action === 'list') continue;
    if (!resourcesWithList.has(resource)) continue;

    const listName = `${resource}:list`;
    if (!selectedNames.has(listName)) {
      throw new VALIDATION_ERROR(
        'Select the List permission for the same resource (e.g. user:list before user:view). Other resources are unaffected.'
      );
    }
  }
}

async function getRoles(query, excludeSuperAdmin = false) {

  const { page, perPage, search, orderBy } = normalizeQuery({
    query,
    allowedSortFields: ['name', 'id']
  });

  const where = {
    ...(excludeSuperAdmin ? { NOT: { name: 'super admin' } } : {}),
    ...(search ? { name: { contains: search } } : {})
  };

  const finalOrderBy = Object.keys(orderBy).length ? orderBy : { id: 'desc' };

  const [items, total] = await Promise.all([
    prisma.role.findMany({
      where,
      skip: perPage * (page - 1),
      take: perPage,
      orderBy: finalOrderBy,
      include: {
        permissions: true,
        _count: { select: { users: true } }
      }
    }),
    prisma.role.count({ where })
  ]);

  return { items, total, page, perPage };

}

async function getRole(id) {

  return prisma.role.findFirst({
    where: { id },
    include: {
      permissions: true,
      _count: {
        select: { users: true }
      }
    }
  });

}

async function storeRole(name, permissionIds = []) {

  const existingRole = await prisma.role.findFirst({
    where: { name }
  });

  if (existingRole) {
    throw new VALIDATION_ERROR(`role with name "${name}" already exists`);
  }

  const data = {
    name,
    permissions: {
      connect: permissionIds.map(id => ({ id: Number(id) }))
    }
  };

  if (permissionIds.length === 0) {
    delete data.permissions;
  }

  await assertListBeforeOtherPermissions(permissionIds);

  return prisma.role.create({
    data,
    include: {
      permissions: true
    }
  });

}

async function updateRole(id, name = null, permissionIds = null) {

  const role = await prisma.role.findFirst({
    where: { id },
    include: { permissions: true }
  });

  if (!role) {
    throw new VALIDATION_ERROR('role not found');
  }

  const data = {};

  if (name) {
    const existingRole = await prisma.role.findFirst({
      where: {
        name,
        NOT: { id }
      }
    });

    if (existingRole) {
      throw new VALIDATION_ERROR(`role with name "${name}" already exists`);
    }

    data.name = name;
  }

  if (Array.isArray(permissionIds)) {
    await assertListBeforeOtherPermissions(permissionIds);
    data.permissions = {
      set: permissionIds.map(id => ({ id: Number(id) }))
    };
  }

  return prisma.role.update({
    where: { id },
    data,
    include: {
      permissions: true
    }
  });

}

async function deleteRole(id) {

  const role = await prisma.role.findFirst({
    where: { id },
    include: {
      _count: {
        select: { users: true }
      }
    }
  });

  if (!role) {
    throw new VALIDATION_ERROR('role not found');
  }

  if (role._count.users > 0) {
    throw new VALIDATION_ERROR(
      `cannot delete role "${role.name}" because it is assigned to ${role._count.users} user(s)`
    );
  }

  return prisma.role.delete({
    where: { id }
  });

}

async function getAllPermissions() {

  return prisma.permission.findMany({
    orderBy: { name: 'asc' }
  });

}

module.exports = {
  getRoles,
  getRole,
  storeRole,
  updateRole,
  deleteRole,
  getAllPermissions
};
