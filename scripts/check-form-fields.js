#!/usr/bin/env node
/**
 * Quick script to inspect what's stored in form_templates.fields
 * Run: node scripts/check-form-fields.js
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const forms = await prisma.formTemplate.findMany({
    select: { id: true, name: true, fields: true }
  });
  console.log(JSON.stringify(forms, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
