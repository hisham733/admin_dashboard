const formService = require('../services/form.service');
const { can, isSuperAdmin } = require('../utilities');

function sessionUserId(req) {
  return req.session.user?.id || null;
}

function hasManageAll(req) {
  return isSuperAdmin(req.session.user) ||
    req.session.user?.permissions?.includes('form:manage_all') || false;
}

function hasActivate(req) {
  return isSuperAdmin(req.session.user) ||
    req.session.user?.permissions?.includes('form:activate') || false;
}

function assertFormAccess(form, req) {
  if (hasManageAll(req)) return;
  const uid = sessionUserId(req);
  if (!uid || form.createdById !== uid) {
    const err = new Error('Forbidden: you do not own this form');
    err.status = 403;
    throw err;
  }
}

async function getForms(req, res) {
  can(req.session.user, 'form:list');
  const userId = sessionUserId(req);
  const canManageAll = hasManageAll(req);
  const canActivate = hasActivate(req);
  const { items: forms, total, page, perPage } = await formService.getForms(req.query, userId, canManageAll);
  res.render('layouts/main', {
    contentPartial: 'form/index',
    contentData: { forms, total, page, perPage, canManageAll, canActivate, query: req.query },
    activeSection: 'forms',
    title: 'Forms Manager'
  });
}

async function getForm(req, res) {
  can(req.session.user, 'form:view');
  const form = await formService.getForm(req.params.id);
  assertFormAccess(form, req);
  res.render('layouts/main', {
    contentPartial: 'form/show',
    contentData: { form, canManageAll: hasManageAll(req) },
    activeSection: 'forms',
    title: form.name
  });
}

async function createForm(req, res) {
  can(req.session.user, 'form:create');
  res.render('layouts/main', {
    contentPartial: 'form/create',
    contentData: {},
    activeSection: 'forms',
    title: 'Create Form Template'
  });
}

async function storeForm(req, res) {
  can(req.session.user, 'form:create');
  const body = req.body || {};
  const payload = {
    template_name: body.template_name !== undefined ? body.template_name : body.name,
    fields: body.fields || []
  };
  const createdById = sessionUserId(req);
  const form = await formService.storeForm(payload, createdById);
  if (req.get('Accept')?.includes('application/json')) {
    return res.status(201).json(form);
  }
  res.redirect('/form?success=' + encodeURIComponent('Form template created successfully'));
}

async function editForm(req, res) {
  can(req.session.user, 'form:update');
  const form = await formService.getForm(req.params.id);
  assertFormAccess(form, req);
  res.render('layouts/main', {
    contentPartial: 'form/edit',
    contentData: { form, canManageAll: hasManageAll(req), canActivate: hasActivate(req) },
    activeSection: 'forms',
    title: 'Edit: ' + form.name
  });
}

async function updateForm(req, res) {
  can(req.session.user, 'form:update');
  const form = await formService.getForm(req.params.id);
  assertFormAccess(form, req);
  const body = req.body || {};
  const payload = {
    template_name: body.template_name !== undefined ? body.template_name : body.name,
    fields: body.fields || []
  };
  const updated = await formService.updateForm(req.params.id, payload);
  if (req.get('Accept')?.includes('application/json')) {
    return res.json(updated);
  }
  res.redirect(
    `/form/${updated.id}/edit?success=${encodeURIComponent('Form template updated successfully')}`
  );
}

async function activateForm(req, res) {
  if (!hasActivate(req)) { can(req.session.user, 'form:activate'); }
  const form = await formService.getForm(req.params.id);
  assertFormAccess(form, req);
  await formService.activateForm(req.params.id);
  const ref = req.get('Referrer') || '/form';
  res.redirect(ref.split('?')[0] + '?success=' + encodeURIComponent('Form "' + form.name + '" is now active'));
}

async function deactivateForm(req, res) {
  if (!hasActivate(req)) { can(req.session.user, 'form:activate'); }
  const form = await formService.getForm(req.params.id);
  assertFormAccess(form, req);
  await formService.deactivateForm(req.params.id);
  const ref = req.get('Referrer') || '/form';
  res.redirect(ref.split('?')[0] + '?success=' + encodeURIComponent('Form "' + form.name + '" has been deactivated'));
}

async function deleteForm(req, res) {
  can(req.session.user, 'form:delete');
  const form = await formService.getForm(req.params.id);
  assertFormAccess(form, req);
  await formService.deleteForm(req.params.id);
  res.redirect('/form?success=' + encodeURIComponent('Form template deleted'));
}

module.exports = {
  getForms,
  getForm,
  createForm,
  storeForm,
  editForm,
  updateForm,
  activateForm,
  deactivateForm,
  deleteForm
};