const userService = require('../services/user.service');
const roleService = require('../services/role.service');
const { can } = require('../utilities');
const prisma = require('../configs/prisma');

async function getUsers(req, res) {
  can(req.session.user, 'user:list');

  const query = req.query;
  const users = await userService.getUsers(query);
  const roles = await roleService.getRoles({ perPage: 100 });
  const roleCount = await prisma.role.count();

  res.render('layouts/main', {
    contentPartial: 'users/index',
    contentData: { users, roles, roleCount },
    activeSection: 'users',
    title: 'User Management'
  });
}

async function editUser(req, res) {
  can(req.session.user, 'user:update');

  const id = Number(req.params.id);
  const user = await userService.getUser(id);

  if (!user) {
    return res.redirect('/user');
  }

  const roles = await roleService.getRoles({ perPage: 100 });

  res.render('layouts/main', {
    contentPartial: 'users/show',
    contentData: { user, roles },
    activeSection: 'users',
    title: `Edit: ${user.name}`
  });
}

async function showUser(req, res) {
  can(req.session.user, 'user:show');

  const id = Number(req.params.id);
  const user = await userService.getUser(id);

  if (!user) {
    return res.redirect('/user');
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

  const roles = await roleService.getRoles({ perPage: 100 });
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

  res.redirect(`/user/${user.id}`);
}

async function updateUser(req, res) {
  can(req.session.user, 'user:update');

  const id = Number(req.params.id);

  const { name, email, password, confirmPassword, roleId } = req.body;

  const user = await userService.updateUser(
    id,
    name,
    email,
    password,
    confirmPassword,
    roleId
  );

  res.redirect(`/user/${user.id}`);
}

async function deleteUser(req, res) {
  can(req.session.user, 'user:delete');

  const id = Number(req.params.id);

  await userService.deleteUser(id);

  res.redirect('/user');
}

module.exports = {
  getUsers,
  showUser,
  createUser,
  editUser,
  storeUser,
  updateUser,
  deleteUser
};