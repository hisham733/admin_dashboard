const prisma = require('../configs/prisma');
const bcrypt = require('bcrypt');
const { passwordHash } = require('../utilities');
const VALIDATION_ERROR = require('../errors/validation.error');

async function getProfile(userId) {
  return prisma.user.findFirst({
    where: { id: userId },
    select: { id: true, name: true, email: true, createdAt: true }
  });
}

async function getProfileByEmail(email) {
  return prisma.user.findFirst({
    where: { email },
    select: { id: true }
  });
}

async function updateProfile(userId, { name, email, currentPassword, newPassword, confirmPassword }) {
  const user = await prisma.user.findFirst({
    where: { id: userId }
  });

  if (!user) {
    throw new VALIDATION_ERROR('User not found');
  }

  const data = {};

  if (name && name.trim()) {
    data.name = name.trim();
  }

  if (email && email.trim()) {
    const existing = await prisma.user.findFirst({
      where: { email: email.trim(), NOT: { id: userId } }
    });
    if (existing) {
      throw new VALIDATION_ERROR('Email already used by another user');
    }
    data.email = email.trim();
  }

  if (newPassword) {
    if (newPassword !== confirmPassword) {
      throw new VALIDATION_ERROR('New password and confirmation do not match');
    }
    if (!currentPassword) {
      throw new VALIDATION_ERROR('Current password is required to change password');
    }
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      throw new VALIDATION_ERROR('Current password is incorrect');
    }
    data.password = await passwordHash(newPassword);
  }

  if (Object.keys(data).length === 0) {
    return user;
  }

  return prisma.user.update({
    where: { id: userId },
    data
  });
}

module.exports = { getProfile, getProfileByEmail, updateProfile };
