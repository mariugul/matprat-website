#!/bin/sh
#
# This script initializes the database with schema and optionally sample data.
# Can be configured via environment variables or command line arguments.
#
# Usage:
#   ./init_database.sh [options]
#
# Environment variables (or use flags):
#   DB_HOST     - Database host (default: localhost)
#   DB_PORT     - Database port (default: 5432)
#   DB_NAME     - Database name (default: matprat)
#   DB_USER     - Database user (default: nodejs)
#   DB_PASSWORD - Database password (default: nodejs)
#   SQL_PATH    - Path to SQL files (default: ./sql)
#
# Options:
#   -h, --host      Database host
#   -p, --port      Database port
#   -d, --database  Database name
#   -u, --user      Database user
#   -w, --password  Database password
#   -s, --sql-path  Path to SQL files
#   --with-data     Also insert sample recipe data
#   --help          Show this help message

set -e

# Defaults (can be overridden by env vars or flags)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-matprat}"
DB_USER="${DB_USER:-nodejs}"
DB_PASSWORD="${DB_PASSWORD:-nodejs}"
SQL_PATH="${SQL_PATH:-./sql}"
WITH_DATA=false

# Parse command line arguments
while [ $# -gt 0 ]; do
  case "$1" in
    -h|--host) DB_HOST="$2"; shift 2 ;;
    -p|--port) DB_PORT="$2"; shift 2 ;;
    -d|--database) DB_NAME="$2"; shift 2 ;;
    -u|--user) DB_USER="$2"; shift 2 ;;
    -w|--password) DB_PASSWORD="$2"; shift 2 ;;
    -s|--sql-path) SQL_PATH="$2"; shift 2 ;;
    --with-data) WITH_DATA=true; shift ;;
    --help)
      head -25 "$0" | tail -23
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

export PGPASSWORD="$DB_PASSWORD"

echo "🗄️  Initializing database..."
echo "   Host: $DB_HOST:$DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo "   SQL Path: $SQL_PATH"

# Create schema (types, tables, functions)
echo "📝 Creating schema..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  -f "${SQL_PATH}/create_all.sql"

# Create users table
echo "👤 Creating users table..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  -f "${SQL_PATH}/create_users.sql"

# Optionally insert sample data
if [ "$WITH_DATA" = true ]; then
  echo "📦 Inserting sample data..."
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    -f "${SQL_PATH}/insert_recipes.sql" \
    -f "${SQL_PATH}/insert_categories.sql" \
    -f "${SQL_PATH}/insert_ingredients.sql" \
    -f "${SQL_PATH}/insert_steps.sql" \
    -f "${SQL_PATH}/insert_images.sql"
fi

echo "✅ Database initialization complete!"