const userService = require('../services/user.service');
const { can } = require('../utilities');

async function getUsers(req, res) {
  can(req.session.user, 'user:list');

  const query = req.query;
  const users = await userService.getUsers(query);

  res.render('users/index', { users });
}

async function showUser(req, res) {
  can(req.session.user, 'user:show');

  const id = Number(req.params.id);
  const user = await userService.getUser(id);

  res.render('users/show', { user });
}

async function createUser(req, res) {
  can(req.session.user, 'user:create');

  res.render('users/create');
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
  storeUser,
  updateUser,
  deleteUser
};