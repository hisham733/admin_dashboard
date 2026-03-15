#!/bin/sh
set -e
host="$1"
port=3306

echo "Waiting for MySQL at $host:$port..."

MAX_TRIES=30
COUNT=0

# Use netcat (nc) to check the port. 
# This is the most reliable way in Alpine Linux.
until nc -z "$host" "$port"; do
  COUNT=$((COUNT + 1))
  if [ "$COUNT" -ge "$MAX_TRIES" ]; then
    echo "ERROR: MySQL port did not open."
    exit 1
  fi
  echo "Still waiting for port... (attempt $COUNT/$MAX_TRIES)"
  sleep 2
done

echo "MySQL port is open! Waiting 5s for service to stabilize..."
sleep 5
