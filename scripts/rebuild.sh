#!/usr/bin/env zsh

# Define a flag variable to check for the presence of -migrate
migrate_flag=false

# Check for the -migrate flag
if [[ "$*" == *"-migrate"* ]]; then
    migrate_flag=true
fi

cd ..
echo " ----- UPPING DOCKER CONTAINERS -----"
docker compose down
./vendor/bin/sail artisan cache:clear
./vendor/bin/sail up -d
docker compose --env-file .env.local up -d


echo "----- LAUNCHING LARAVEL SERVER -----"
php artisan serve --host=127.0.0.1 --port=8000 > laravel.log 2>&1 &

# Check the migrate_flag and execute migrations if true
if [ "$migrate_flag" = true ]; then
    echo "----- EXECUTING MIGRATIONS -----"
    ./vendor/bin/sail artisan migrate
fi
