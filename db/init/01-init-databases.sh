#!/bin/bash
set -e

# Create databases for development and production
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE perceptacle_dev;
    CREATE DATABASE perceptacle_test;
    GRANT ALL PRIVILEGES ON DATABASE perceptacle_dev TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE perceptacle_test TO $POSTGRES_USER;
EOSQL

echo "Databases created successfully!"
