#!/bin/bash

# Set the Laravel project path
PROJECT_PATH=$(dirname "$(realpath "$0")")/..

# Check if the Laravel project exists
if [ ! -d "$PROJECT_PATH" ]; then
    echo "Error: Laravel project not found at $PROJECT_PATH"
    exit 1
fi

# Source the .env file to load environment variables
source "$PROJECT_PATH"/.env

# Check if the required environment variables are set
if [ -z "$DB_DATABASE" ] || [ -z "$DB_USERNAME" ] || [ -z "$DB_PASSWORD" ]; then
    echo "Error: Database environment variables not set in .env"
    exit 1
fi

# Check if the database exists
if [ -z "$(mysql -u $DB_USERNAME -p$DB_PASSWORD -e "SHOW DATABASES LIKE '$DB_DATABASE';" 2>/dev/null)" ]; then
    echo "Creating database $DB_DATABASE..."
    mysql -u $DB_USERNAME -p$DB_PASSWORD -e "CREATE DATABASE $DB_DATABASE;"
    echo "Database $DB_DATABASE created!"
fi


composer install --working-dir="$PROJECT_PATH"
npm install --prefix "$PROJECT_PATH"
npm run dev


# Stop services
"$PROJECT_PATH"/vendor/bin/sail down

# Clear PHP cache
"$PROJECT_PATH"/vendor/bin/sail artisan optimize:clear

# Start services in detached mode
"$PROJECT_PATH"/vendor/bin/sail up -d

# Run migrations
"$PROJECT_PATH"/vendor/bin/sail artisan migrate:fresh

# Load seeders from UserbaseDev.php
"$PROJECT_PATH"/vendor/bin/sail artisan db:seed --class=UserbaseDev

echo "Laravel project setup complete!"
