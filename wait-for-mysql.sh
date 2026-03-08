#!/bin/sh
set -e

host="$1"
shift

until mysql -h "$host" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1" &> /dev/null; do
  echo "Waiting for MySQL at $host..."
  sleep 2
done

exec "$@"