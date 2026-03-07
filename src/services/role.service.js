const prisma = require('../configs/prisma');
const { buildQuery, normalizeQuery } = require('../utilities');
const VALIDATION_ERROR = require('../errors/validation.error');

async function getRoles(query) {

  const { page, perPage, search, orderBy } = normalizeQuery({ query });

  return buildQuery({
    prisma,
    model: "role",
    page,
    perPage,
    orderBy: Object.keys(orderBy).length ? orderBy : { id: 'desc' },
    keyword: search,
    columns: ["name"]
  });

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
