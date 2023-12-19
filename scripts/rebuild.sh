#!/bin/bash

# Set the Laravel project path
PROJECT_PATH=$(dirname "$(realpath "$0")")/..

# Check if the Laravel project exists
if [ ! -d "$PROJECT_PATH" ]; then
    echo "Error: Laravel project not found at $PROJECT_PATH"
    exit 1
fi

# Stop services
"$PROJECT_PATH"/vendor/bin/sail down

# Start services in detached mode
"$PROJECT_PATH"/vendor/bin/sail up -d

composer install --working-dir="$PROJECT_PATH"
npm install --prefix "$PROJECT_PATH"

# Clear PHP cache
"$PROJECT_PATH"/vendor/bin/sail artisan optimize:clear

# Run migrations
"$PROJECT_PATH"/vendor/bin/sail artisan migrate:fresh

# Load seeders from UserbaseDev.php
"$PROJECT_PATH"/vendor/bin/sail artisan db:seed --class=UserbaseDev

echo "Laravel project setup complete!"
npm run dev

