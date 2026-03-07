const seedPermissions = require('./permission.seeder');
const seedRoles = require('./role.seeder');
const seedSuperAdmin = require('./user.seeder');
const prisma = require('../configs/prisma');

async function run() {
  console.log("Seeding permissions...");
  await seedPermissions();

  console.log("Seeding roles...");
  await seedRoles();

  console.log("Seeding super admin...");
  await seedSuperAdmin();

  await prisma.$disconnect();
}

run();