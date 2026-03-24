const userService = require('../services/user.service');
const roleService = require('../services/role.service');
const { can, redirectToList, redirectToListSuccess } = require('../utilities');
const prisma = require('../configs/prisma');

async function getUsers(req, res) {
  can(req.session.user, 'user:list');

  const currentUserId = req.session.user?.id || null;
  const { items: users, total, page, perPage } = await userService.getUsers(req.query, currentUserId);
  const { items: roles } = await roleService.getRoles({ perPage: 100 }, true);
  const roleCount = await prisma.role.count({ where: { NOT: { name: 'super admin' } } });

  res.render('layouts/main', {
    contentPartial: 'users/index',
    contentData: { users, total, page, perPage, roles, roleCount, query: req.query },
    activeSection: 'users',
    title: 'User Management'
  });
}

async function editUser(req, res) {
  can(req.session.user, 'user:update');

  const id = Number(req.params.id);
  const user = await userService.getUser(id);

  if (!user) {
    return redirectToList(res, 'user');
  }

  const { items: roles } = await roleService.getRoles({ perPage: 100 }, true);

  res.render('layouts/main', {
    contentPartial: 'users/show',
    contentData: { user, roles },
    activeSection: 'users',
    title: `Edit: ${user.name}`
  });
}

async function getUser(req, res) {
  can(req.session.user, 'user:view');

  const id = Number(req.params.id);
  const user = await userService.getUser(id);

  if (!user) {
    return redirectToList(res, 'user');
  }

  const roles = await roleService.getRoles({ perPage: 100 });

  res.render('layouts/main', {
    contentPartial: 'users/show',
    contentData: { user, roles },
    activeSection: 'users',
    title: `User: ${user.name}`
  });
}

async function createUser(req, res) {
  can(req.session.user, 'user:create');

  const { items: roles } = await roleService.getRoles({ perPage: 100 }, true);
  const permissions = await roleService.getAllPermissions();

  res.render('layouts/main', {
    contentPartial: 'users/create',
    contentData: { roles, permissions },
    activeSection: 'users',
    title: 'Add New User'
  });
}

async function storeUser(req, res) {
  can(req.session.user, 'user:create');

  const { name, email, password, confirmPassword, roleId } = req.body;

  const user = await userService.storeUser(
    name,
    email,
    password,
    confirmPassword,
    roleId
  );

  redirectToListSuccess(res, 'user', 'User created successfully');
}

async function updateUser(req, res) {
  can(req.session.user, 'user:update');

  const id = Number(req.params.id);

  const { name, email, password, confirmPassword, roleId } = req.body;

  await userService.updateUser(
    id,
    name,
    email,
    password,
    confirmPassword,
    roleId
  );

  res.redirect(
    `/user/${id}/edit?success=${encodeURIComponent('User updated successfully')}`
  );
}

async function deleteUser(req, res) {
  can(req.session.user, 'user:delete');

  const id = Number(req.params.id);

  await userService.deleteUser(id);

  redirectToListSuccess(res, 'user', 'User deleted successfully');
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  editUser,
  storeUser,
  updateUser,
  deleteUser
};