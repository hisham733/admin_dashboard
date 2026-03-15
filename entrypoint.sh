#!/bin/sh
set -e
host="$1"

# 1. Wait for MySQL port to open
./wait-for-mysql.sh "$host"

# 2. Generate Prisma Client (Fixes the "did not initialize yet" error)
echo "Generating Prisma Client..."
npx prisma generate

# 3. Apply migrations
echo "Applying Prisma migrations..."
npx prisma db  push

# 4. Run seeding
echo "Running seed script..."
npm run start-seed

# 5. Start the server
echo "Starting application..."
exec npm run dev
