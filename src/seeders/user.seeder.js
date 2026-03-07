const prisma = require('../configs/prisma');
const bcrypt = require('bcrypt');

async function seedSuperAdmin() {

  const email = "superadmin@system.local";
  const password = "123456";

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