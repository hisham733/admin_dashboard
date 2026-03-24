const roleService = require('../services/role.service');
const prisma = require('../configs/prisma');
const { can } = require('../utilities');

async function getRoles(req, res) {
  can(req.session.user, 'role:list');

  const { items: roles, total, page, perPage } = await roleService.getRoles(req.query, true);
  const userCount = await prisma.user.count({ where: { NOT: { role: { name: 'super admin' } } } });
  const permissionCount = await prisma.permission.count();

  res.render('layouts/main', {
    contentPartial: 'roles/index',
    contentData: { roles, total, page, perPage, userCount, permissionCount, query: req.query },
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
    res.redirect(`/role?success=${encodeURIComponent('Role created successfully')}`);
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
    res.redirect(
      `/role/${id}/edit?success=${encodeURIComponent('Role updated successfully')}`
    );
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
    res.redirect('/role?success=' + encodeURIComponent('Role deleted successfully'));
  } catch (err) {
    res.redirect('/role?error=' + encodeURIComponent(err.message));
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
