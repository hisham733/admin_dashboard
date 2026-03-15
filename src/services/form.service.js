const prisma = require('../configs/prisma');
const { buildQuery, normalizeQuery } = require('../utilities');
const VALIDATION_ERROR = require('../errors/validation.error');

const TYPE_TO_HTML = {
  string: 'text',
  number: 'number',
  email: 'email',
  phone: 'tel',
  date: 'date',
  textarea: 'textarea',
  options: 'checkbox',
  radio: 'radio'
};

function addHtmlType(field) {
  let type = field.type || 'string';
  if (type === 'boolean') {
    type = 'radio';
    field = { ...field, type: 'radio', options: ['Yes', 'No'] };
  }
  return { ...field, htmlType: TYPE_TO_HTML[type] || 'text' };
}

function isGroup(item) {
  return item && Array.isArray(item.fields) && !('type' in item);
}

function isField(item) {
  return item && 'type' in item;
}

function collectAllFieldNames(fieldsArr) {
  const names = [];
  function walk(items) {
    if (!Array.isArray(items)) return;
    items.forEach((it) => {
      if (isGroup(it)) walk(it.fields);
      else if (isField(it) && it.name) names.push(it.name);
    });
  }
  walk(fieldsArr);
  return names;
}

function ensureFieldsStructure(raw) {
  if (!raw) return { fields: [] };
  const arr = Array.isArray(raw) ? raw : (typeof raw === 'string' ? (() => { try { return JSON.parse(raw); } catch { return []; } })() : []);
  if (arr.length === 0) return { fields: [] };

  const result = [];
  let order = 0;
  arr.forEach((it) => {
    if (isGroup(it)) {
      const groupFields = (it.fields || []).map((f, idx) => {
        const base = { id: f.id ?? `f_${Date.now()}_${idx}`, name: f.name || '', type: f.type || 'string', is_required: f.is_required !== false };
    if (f.type === 'options' || f.type === 'radio') {
      base.options = Array.isArray(f.options) ? f.options.filter(Boolean) : [];
      base.default_option = (f.default_option && String(f.default_option).trim()) || null;
    }
        return addHtmlType(base);
      });
      result.push({ id: it.id || `grp_${Date.now()}_${order}`, name: it.name || '', order: it.order ?? order, fields: groupFields });
      order++;
    } else if (isField(it)) {
      const base = { id: it.id ?? `f_${Date.now()}_${result.length}`, name: it.name || '', type: it.type || 'string', is_required: it.is_required !== false };
      if (it.type === 'options' || it.type === 'radio') {
        base.options = Array.isArray(it.options) ? it.options.filter(Boolean) : [];
        base.default_option = (it.default_option && String(it.default_option).trim()) || null;
      }
      result.push(addHtmlType(base));
    }
  });
  return { fields: result };
}

function normalizeFields(payload) {
  const raw = payload?.fields ?? payload;
  if (!Array.isArray(raw) || raw.length === 0) return { fields: [] };

  const result = [];
  let order = 0;
  raw.forEach((it) => {
    if (isGroup(it)) {
      const groupFields = (it.fields || []).map((f) => {
        const base = { id: f.id, name: (f.name && String(f.name).trim()) || '', type: f.type || 'string', is_required: f.is_required !== false };
    if (f.type === 'options' || f.type === 'radio') {
      base.options = Array.isArray(f.options) ? f.options.filter(Boolean) : [];
      base.default_option = (f.default_option && String(f.default_option).trim()) || null;
    }
        return addHtmlType(base);
      });
      result.push({ id: it.id, name: (it.name && String(it.name).trim()) || '', order: it.order ?? order, fields: groupFields });
      order++;
    } else if (isField(it)) {
      const base = { id: it.id, name: (it.name && String(it.name).trim()) || '', type: it.type || 'string', is_required: it.is_required !== false };
      if (it.type === 'options' || it.type === 'radio') {
        base.options = Array.isArray(it.options) ? it.options.filter(Boolean) : [];
        base.default_option = (it.default_option && String(it.default_option).trim()) || null;
      }
      result.push(addHtmlType(base));
    }
  });
  return { fields: result };
}

function validateFieldsStructure({ fields }) {
  if (!fields || fields.length === 0) throw new VALIDATION_ERROR('At least one field or group is required');

  function walk(items) {
    if (!Array.isArray(items)) return;
    items.forEach((it) => {
      if (isGroup(it)) {
        if (!(it.name && String(it.name).trim())) throw new VALIDATION_ERROR('Group must have a name');
        (it.fields || []).forEach((f) => {
          if (!(f.name && String(f.name).trim())) throw new VALIDATION_ERROR('All fields must have a name');
          if ((f.type === 'options' || f.type === 'radio') && (!f.options || f.options.length === 0)) throw new VALIDATION_ERROR('Choose from list / Single choice fields must have at least one choice');
          if ((f.type === 'options' || f.type === 'radio') && f.default_option && !f.options.includes(f.default_option)) throw new VALIDATION_ERROR('Pre-selected must be one of the choices');
        });
        walk(it.fields);
      } else if (isField(it)) {
        if (!(it.name && String(it.name).trim())) throw new VALIDATION_ERROR('All fields must have a name');
        if ((it.type === 'options' || it.type === 'radio') && (!it.options || it.options.length === 0)) throw new VALIDATION_ERROR('Choose from list / Single choice fields must have at least one choice');
        if ((it.type === 'options' || it.type === 'radio') && it.default_option && !it.options.includes(it.default_option)) throw new VALIDATION_ERROR('Pre-selected must be one of the choices');
      }
    });
  }
  walk(fields);

  const names = collectAllFieldNames(fields);
  if (names.some((n, i) => names.indexOf(n) !== i)) throw new VALIDATION_ERROR('Field names must be unique');
}

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

async function getForm(id) {
  const form = await prisma.formTemplate.findFirst({
    where: { id: Number(id) }
  });
  if (!form) throw new VALIDATION_ERROR('Form template not found');
  form.fields = ensureFieldsStructure(form.fields).fields;
  return form;
}

async function storeForm({ template_name, fields }, createdById = null) {
  const name = (template_name && String(template_name).trim()) || 'Untitled Form';
  const { fields: fieldList } = normalizeFields({ fields: fields || [] });
  validateFieldsStructure({ fields: fieldList });

  const existingCount = await prisma.formTemplate.count();
  const isFirstForm = existingCount === 0;
  return prisma.formTemplate.create({
    data: {
      name,
      fields: fieldList,
      isActive: isFirstForm,
      ...(createdById ? { createdById } : {})
    }
  });
}

async function updateForm(id, { template_name, fields }) {
  const form = await getForm(id);
  const name = (template_name && String(template_name).trim()) || form.name;
  const { fields: fieldList } = normalizeFields({ fields: fields || [] });
  validateFieldsStructure({ fields: fieldList });

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
