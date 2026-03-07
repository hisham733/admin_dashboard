const roleService = require('../services/role.service');
const prisma = require('../configs/prisma');
const { can } = require('../utilities');

async function getRoles(req, res) {
  can(req.session.user, 'role:list');

  const query = req.query;
  const roles = await roleService.getRoles({ ...query, perPage: 100 });
  const userCount = await prisma.user.count();
  const permissionCount = await prisma.permission.count();

  res.render('layouts/main', {
    contentPartial: 'roles/index',
    contentData: { roles, userCount, permissionCount },
    activeSection: 'roles',
    title: 'Role Management'
  });
}

async function showRole(req, res) {
  can(req.session.user, 'role:view');
  return res.redirect(`/role/${req.params.id}/edit`);
}

async function createRole(req, res) {
  can(req.session.user, 'role:create');

  const permissions = await roleService.getAllPermissions();

  res.render('layouts/main', {
    contentPartial: 'roles/create',
    contentData: { permissions },
    activeSection: 'roles',
    title: 'Add New Role'
  });
}

async function storeRole(req, res) {
  can(req.session.user, 'role:create');

  const { name, permissionIds } = req.body;

  const ids = Array.isArray(permissionIds) ? permissionIds : (permissionIds ? [permissionIds] : []);

  try {
    const role = await roleService.storeRole(name, ids);
    res.redirect(`/role`);
  } catch (err) {
    const permissions = await roleService.getAllPermissions();
    res.render('layouts/main', {
      contentPartial: 'roles/create',
      contentData: { permissions, error: err.message },
      activeSection: 'roles',
      title: 'Add New Role'
    });
  }
}

async function editRole(req, res) {
  can(req.session.user, 'role:update');

  const id = Number(req.params.id);
  const role = await roleService.getRole(id);

  if (!role) {
    return res.redirect('/role');
  }

  const permissions = await roleService.getAllPermissions();

  res.render('layouts/main', {
    contentPartial: 'roles/edit',
    contentData: { role, permissions },
    activeSection: 'roles',
    title: `Edit: ${role.name}`
  });
}

async function updateRole(req, res) {
  can(req.session.user, 'role:update');

  const id = Number(req.params.id);
  const { name, permissionIds } = req.body;

  const ids = Array.isArray(permissionIds) ? permissionIds : (permissionIds ? [permissionIds] : []);

  try {
    await roleService.updateRole(id, name, ids);
    res.redirect('/role');
  } catch (err) {
    const role = await roleService.getRole(id);
    const permissions = await roleService.getAllPermissions();
    res.render('layouts/main', {
      contentPartial: 'roles/edit',
      contentData: { role, permissions, error: err.message },
      activeSection: 'roles',
      title: `Edit: ${role.name}`
    });
  }
}

async function deleteRole(req, res) {
  can(req.session.user, 'role:delete');

  const id = Number(req.params.id);

  try {
    await roleService.deleteRole(id);
    res.redirect('/role');
  } catch (err) {
    const roles = await roleService.getRoles({ perPage: 100 });
    const userCount = await prisma.user.count();
    const permissionCount = await prisma.permission.count();
    res.render('layouts/main', {
      contentPartial: 'roles/index',
      contentData: { roles, userCount, permissionCount, error: err.message },
      activeSection: 'roles',
      title: 'Role Management'
    });
  }
}

module.exports = {
  getRoles,
  showRole,
  createRole,
  storeRole,
  editRole,
  updateRole,
  deleteRole
};
