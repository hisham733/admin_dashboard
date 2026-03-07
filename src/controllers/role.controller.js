const roleService = require('../services/role.service');
const { can } = require('../utilities');

async function getRoles(req, res) {
  can(req.session.user, 'role:list');

  const query = req.query;
  const roles = await roleService.getRoles(query);

  res.json(roles);
}

async function showRole(req, res) {
  can(req.session.user, 'role:view');

  const id = Number(req.params.id);
  const role = await roleService.getRole(id);

  if (!role) {
    return res.status(404).json({ error: 'Role not found' });
  }

  res.json(role);
}

async function createRole(req, res) {
  can(req.session.user, 'role:create');

  const permissions = await roleService.getAllPermissions();

  res.json({ permissions });
}

async function storeRole(req, res) {
  can(req.session.user, 'role:create');

  const { name, permissionIds } = req.body;

  const role = await roleService.storeRole(name, permissionIds || []);

  res.status(201).json(role);
}

async function updateRole(req, res) {
  can(req.session.user, 'role:update');

  const id = Number(req.params.id);
  const { name, permissionIds } = req.body;

  const role = await roleService.updateRole(id, name, permissionIds);

  res.json(role);
}

async function deleteRole(req, res) {
  can(req.session.user, 'role:delete');

  const id = Number(req.params.id);

  await roleService.deleteRole(id);

  res.status(204).send();
}

module.exports = {
  getRoles,
  showRole,
  createRole,
  storeRole,
  updateRole,
  deleteRole
};
