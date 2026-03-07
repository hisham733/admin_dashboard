const VALIDATION_ERROR = require('./errors/validation.error'); 
const bcrypt = require('bcrypt');


/** 
 * @param {object} user
 * @param {string} permission
 * @param {'response'} res
 * 
 * function used to authorize the customer
 */
function can(user, permission) {

  if (!user?.permissions?.includes(permission)) {
    throw new VALIDATION_ERROR("Unauthorized user");
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
  columns = []
}) => {
  return prisma[model].findMany({
    where: keyword
      ? {
          OR: columns.map(col => ({
            [col]: {
              contains: keyword,
              mode: "insensitive"
            }
          }))
        }
      : {},

    skip: perPage * (page - 1),
    take: perPage,
    orderBy
  });
};

async function  passwordHash(password) {  
  return  await bcrypt.hash(password, 10);
}

module.exports = { can, asyncHandler, buildQuery, normalizeQuery}; 