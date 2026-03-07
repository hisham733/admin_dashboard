const prisma = require('../configs/prisma');
const VALIDATION_ERROR = require('../errors/validation.error');
const {hashedPassword} = require('../utilities');

async function register(name, email, password, confirmPassword) {
  const existingUser = await prisma.user.findUnique({
    where: { email: email }
  });
  
  if (existingUser) {
    throw new VALIDATION_ERROR('User already exists');
  }

  const role = await prisma.role.findUnique({
    where: { name: 'user' }
  });

  if (!role) {
    throw new VALIDATION_ERROR('Role not found');
  }

  if(password !== confirmPassword) {  
      throw new VALIDATION_ERROR('Confirm password not matching the password'); 
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
    throw new VALIDATION_ERROR('Incorrect email or password');
  }

  const valid = await hashedPassword(password);

  if (!valid) {
    throw new VALIDATION_ERROR('Incorrect email or password');
  }

  return user;
}

async function logout(session)  {  

   session.destroy((err) => {
    if (err) {
      console.log(err); 
      return res.status(500).send('Could not log out');
    }
  });
}

module.exports = {
  register,
  login,
  logout
};