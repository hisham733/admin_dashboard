#!/bin/sh
set -e

host="$1"
shift
./wait-for-mysql.sh $host

echo "Applying Prisma migrations..."
npx prisma migrate deploy

echo "Running seed script..."
npm run start-seed

echo "Starting application..."
npm run start