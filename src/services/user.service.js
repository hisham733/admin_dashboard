const prisma = require('../configs/prisma');
const { buildQuery, normalizeQuery, passwordHash } = require('../utilities');
const VALIDATION_ERROR = require('../errors/validation.error');

const SUPER_ADMIN_EMAIL = 'superadmin@system.local';

async function getUsers(query, excludeUserId = null) {
  const { page, perPage, search, orderBy } = normalizeQuery({
    query,
    allowedSortFields: ['name', 'email', 'createdAt']
  });
  const finalOrderBy = Object.keys(orderBy).length ? orderBy : { id: 'desc' };
  const skip = perPage * (page - 1);

  // Always exclude super admin account and optionally the current user
  const superAdmin = await prisma.user.findFirst({
    where: { email: SUPER_ADMIN_EMAIL },
    select: { id: true }
  });

  const excludeIds = [superAdmin?.id].filter(Boolean);
  if (excludeUserId) excludeIds.push(excludeUserId);

  const where = {
    NOT: { id: { in: excludeIds } },
    ...(search ? {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } }
      ]
    } : {})
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: perPage,
      orderBy: finalOrderBy,
      include: { role: true }
    }),
    prisma.user.count({ where })
  ]);

  return { items, total, page, perPage };
}

async function getUser(id) { 
   return prisma.user.findFirst({ 
        where: { id },
        include: { role: true }
   }); 
}

async function storeUser(name, email, password, confirmPassword, roleId = null) {

  let role = null;

  if (roleId) {
    role = await prisma.role.findFirst({
      where: {
        id: Number(roleId)
      }
    });

    if (!role) {
      throw new VALIDATION_ERROR('user role not found');
    }
  }

  if(password !== confirmPassword) {  
    throw new VALIDATION_ERROR('password and confirm password not matched');
  }

  const existingUser = await prisma.user.findFirst({ 
    where: {  
        email: email
    }
  }); 

  if (existingUser) {  
    throw new VALIDATION_ERROR(`user with ${email} is already exists`); 
  }

  return prisma.user.create({
    data: {
      name,
      email,
      password: await passwordHash(password),
       ...(roleId && {
        role: {
          connect: { id: Number(roleId) }
        }
      })
    }
  });
}

async function updateUser(
  id,
  name = null,
  email = null,
  password = null,
  confirmPassword = null,
  roleId = null
) {

  const user = await prisma.user.findFirst({
    where: { id }
  });

  if (!user) {
    throw new VALIDATION_ERROR('user not found');
  }

  if (password && password !== confirmPassword) {
    throw new VALIDATION_ERROR('password and confirm password not matched');
  }

  if (roleId) {
    const role = await prisma.role.findFirst({
      where: { id: Number(roleId) }
    });

    if (!role) {
      throw new VALIDATION_ERROR('user role not found');
    }
  }

  const data = {};

  if (name) {
    data.name = name;
  }

  if (email) {

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id }
      }
    });

    if (existingUser) {
      throw new VALIDATION_ERROR('email already used by other user');
    }

    data.email = email;
  }

  if (password) {
    data.password = passwordHash(password);
  }

  if (roleId) {
    data.role = {
      connect: { id: Number(roleId) }
    };
  }

  return prisma.user.update({
    where: { id },
    data
  });

}

async function deleteUser(id) {

  const user = await prisma.user.findFirst({
    where: { id }
  });

  if (!user) {
    throw new VALIDATION_ERROR('user not found');
  }

  return prisma.user.delete({
    where: { id }
  });

}

module.exports = {getUsers, getUser, updateUser, deleteUser, storeUser};