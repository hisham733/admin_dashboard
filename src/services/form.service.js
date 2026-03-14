const prisma = require('../configs/prisma');
const { buildQuery, normalizeQuery } = require('../utilities');
const VALIDATION_ERROR = require('../errors/validation.error');

async function getForms(query = {}, userId = null, canManageAll = false) {
  const { page, perPage, search, orderBy } = normalizeQuery({
    query,
    allowedSortFields: ['name', 'createdAt', 'updatedAt']
  });

  const userFilter = (!canManageAll && userId) ? { createdById: userId } : {};
  const keyword = search;
  const where = {
    ...userFilter,
    ...(keyword ? { name: { contains: keyword } } : {})
  };
  const finalOrderBy = Object.keys(orderBy).length ? orderBy : { updatedAt: 'desc' };
  const skip = perPage * (page - 1);

  const [items, total] = await Promise.all([
    prisma.formTemplate.findMany({
      where,
      skip,
      take: perPage,
      orderBy: finalOrderBy,
      include: { createdBy: { select: { id: true, name: true } } }
    }),
    prisma.formTemplate.count({ where })
  ]);

  return { items, total, page, perPage };
}

function ensureFieldsStructure(fields) {
  if (!fields) return [];
  const arr = Array.isArray(fields) ? fields : (typeof fields === 'string' ? (() => { try { return JSON.parse(fields); } catch { return []; } })() : []);
  return arr.map((f) => {
    const base = { name: f.name || '', type: f.type || 'string', is_required: f.is_required !== false };
    if (f.type === 'options') {
      base.options = Array.isArray(f.options) ? f.options.filter(Boolean) : [];
      base.default_option = (f.default_option && String(f.default_option).trim()) || null;
    }
    return base;
  });
}

async function getForm(id) {
  const form = await prisma.formTemplate.findFirst({
    where: { id: Number(id) }
  });
  if (!form) throw new VALIDATION_ERROR('Form template not found');
  form.fields = ensureFieldsStructure(form.fields);
  return form;
}

function normalizeFields(fields) {
  if (!Array.isArray(fields)) return [];
  return fields.map((f) => {
    const base = {
      name: (f.name && String(f.name).trim()) || '',
      type: f.type || 'string',
      is_required: f.is_required !== false
    };
    if (f.type === 'options') {
      base.options = Array.isArray(f.options) ? f.options.filter(Boolean) : [];
      base.default_option = (f.default_option && String(f.default_option).trim()) || null;
    }
    return base;
  });
}

async function storeForm({ template_name, fields }, createdById = null) {
  const name = (template_name && String(template_name).trim()) || 'Untitled Form';
  const fieldList = normalizeFields(fields || []);
  if (fieldList.some((f) => !f.name)) {
    throw new VALIDATION_ERROR('All fields must have a name');
  }
  if (fieldList.some((f) => f.type === 'options' && (!f.options?.length))) {
    throw new VALIDATION_ERROR('Choose from list fields must have at least one choice');
  }
  if (fieldList.some((f) => f.type === 'options' && f.default_option && !f.options?.includes(f.default_option))) {
    throw new VALIDATION_ERROR('Pre-selected must be one of the choices');
  }
  const names = fieldList.map((f) => f.name);
  if (names.some((n, i) => names.indexOf(n) !== i)) {
    throw new VALIDATION_ERROR('Field names must be unique');
  }
  return prisma.formTemplate.create({
    data: {
      name,
      fields: fieldList,
      ...(createdById ? { createdById } : {})
    }
  });
}

async function updateForm(id, { template_name, fields }) {
  const form = await getForm(id);
  const name = (template_name && String(template_name).trim()) || form.name;
  const fieldList = normalizeFields(fields || []);
  if (fieldList.some((f) => !f.name)) {
    throw new VALIDATION_ERROR('All fields must have a name');
  }
  if (fieldList.some((f) => f.type === 'options' && (!f.options?.length))) {
    throw new VALIDATION_ERROR('Choose from list fields must have at least one choice');
  }
  if (fieldList.some((f) => f.type === 'options' && f.default_option && !f.options?.includes(f.default_option))) {
    throw new VALIDATION_ERROR('Pre-selected must be one of the choices');
  }
  const names = fieldList.map((f) => f.name);
  if (names.some((n, i) => names.indexOf(n) !== i)) {
    throw new VALIDATION_ERROR('Field names must be unique');
  }
  return prisma.formTemplate.update({
    where: { id: form.id },
    data: { name, fields: fieldList }
  });
}

async function activateForm(id) {
  const form = await getForm(id);
  await prisma.$transaction([
    prisma.formTemplate.updateMany({ data: { isActive: false } }),
    prisma.formTemplate.update({ where: { id: form.id }, data: { isActive: true } })
  ]);
  return prisma.formTemplate.findUnique({ where: { id: form.id } });
}

async function deactivateForm(id) {
  const form = await getForm(id);
  return prisma.formTemplate.update({
    where: { id: form.id },
    data: { isActive: false }
  });
}

async function deleteForm(id) {
  const form = await getForm(id);
  return prisma.formTemplate.delete({
    where: { id: form.id }
  });
}

module.exports = {
  getForms,
  getForm,
  storeForm,
  updateForm,
  activateForm,
  deactivateForm,
  deleteForm
};
