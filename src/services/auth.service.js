const prisma = require('../configs/prisma');
const bcrypt = require('bcrypt');

async function register(name, email, password, confirmPassword) {
  const existingUser = await prisma.user.findUnique({
    where: { email: email }
  });
  
  if (existingUser) {
    throw new Error('User already exists');
  }

  const role = await prisma.role.findUnique({
    where: { name: 'user' }
  });

  if (!role) {
    throw new Error('Role not found');
  }

  if(password !== confirmPassword) {  
      throw new Error('Confirm password not matching the password'); 
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      roleId: role.id
    }
  });

  return newUser;
}

async function login(email, password) {

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: {
        include: {
          permissions: true
        }
      }
    }
  });

  if (!user) {
    throw new Error('Incorrect email or password');
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    throw new Error('Incorrect email or password');
  }

  return user;
}

module.exports = {
  register,
  login
};