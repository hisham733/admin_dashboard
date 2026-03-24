const bcrypt = require('bcrypt');
const HttpStatus = require('./enums/http.status.enum');


/** 
 * @param {object} user
 * @param {string} permission
 * @param {'response'} res
 * 
 * function used to authorize the customer
 */
function isSuperAdmin(user) {
  return user?.role?.name === 'super admin';
}

function can(user, permission) {
  if (isSuperAdmin(user)) return true;

  if (!user?.permissions?.includes(permission)) {
    const err = new Error(HttpStatus.getMessage(HttpStatus.FORBIDDEN));
    err.status = HttpStatus.FORBIDDEN;
    throw err;
  }

  return true;
}

function asyncHandler(fn) {
   return function(req,res,next){
      Promise.resolve(fn(req,res,next)).catch(next);
   }
}

const normalizeQuery = ({
  query = {},
  allowedSortFields = [],
}) => {

  const page = Math.max(1, Number(query.page) || 1);
  const perPage = Math.max(1, Number(query.perPage) || 10);
  const search = query.search || null;

  const orderBy = {};

  if (query.sort) {
    query.sort.split(",").forEach(sortItem => {

      const [field, direction] = sortItem.split(":");

      if (!field) return;

      if (allowedSortFields.length &&
          !allowedSortFields.includes(field)) return;

      orderBy[field] = direction === "desc" ? "desc" : "asc";

    });
  }

  return {
    page,
    perPage,
    search,
    orderBy,
  };

};

const buildQuery = async ({
  prisma,
  model,
  page = 1,
  perPage = 10,
  orderBy = {id: 'desc'},
  keyword = null,
  columns = [],
  includeCount = false
}) => {
  const where = keyword && columns.length
    ? {
        OR: columns.map(col => ({
          [col]: { contains: keyword, mode: "insensitive" }
        }))
      }
    : {};
  const skip = perPage * (page - 1);
  const take = perPage;
  const finalOrderBy = Object.keys(orderBy).length ? orderBy : { id: 'desc' };

  if (includeCount) {
    const [items, total] = await Promise.all([
      prisma[model].findMany({ where, skip, take, orderBy: finalOrderBy }),
      prisma[model].count({ where })
    ]);
    return { items, total, page, perPage };
  }
  return prisma[model].findMany({
    where,
    skip,
    take,
    orderBy: finalOrderBy
  });
};

async function  passwordHash(password) {  
  return  await bcrypt.hash(password, 10);
}

/**
 * Canonical list URLs for resources. After create/delete, redirect here.
 * After successful update, controllers typically redirect to /:id/edit with ?success= instead.
 */
const RESOURCE_LIST_PATHS = {
  user: '/user',
  role: '/role',
  form: '/form'
};

function redirectToList(res, resourceKey) {
  const path = RESOURCE_LIST_PATHS[resourceKey];
  if (!path) throw new Error(`Unknown resource list: ${resourceKey}`);
  res.redirect(path);
}

function redirectToListSuccess(res, resourceKey, message) {
  const path = RESOURCE_LIST_PATHS[resourceKey];
  if (!path) throw new Error(`Unknown resource list: ${resourceKey}`);
  res.redirect(`${path}?success=${encodeURIComponent(message)}`);
}

function redirectToListError(res, resourceKey, message) {
  const path = RESOURCE_LIST_PATHS[resourceKey];
  if (!path) throw new Error(`Unknown resource list: ${resourceKey}`);
  res.redirect(`${path}?error=${encodeURIComponent(message)}`);
}

module.exports = {
  can,
  isSuperAdmin,
  asyncHandler,
  buildQuery,
  normalizeQuery,
  passwordHash,
  RESOURCE_LIST_PATHS,
  redirectToList,
  redirectToListSuccess,
  redirectToListError
}; 