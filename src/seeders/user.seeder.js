const prisma = require('../configs/prisma');
const bcrypt = require('bcrypt');
const {app} = require('../configs/app.config');

async function seedSuperAdmin() {

  const email = app.super_admin_email;
  const password = app.super_admin_password;

  const role = await prisma.role.findUnique({
    where: { name: "super admin" }
  });

  if (!role) {
    console.log("❌ Super admin role not found. Seed roles first.");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: {
        connect: { id: role.id }
      }
    },
    create: {
      name: "Super Admin",
      email,
      password: hashedPassword,
      role: {
        connect: { id: role.id }
      }
    }
  });
}

module.exports = seedSuperAdmin;