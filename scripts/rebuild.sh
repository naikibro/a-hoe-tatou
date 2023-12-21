#!/bin/bash

# Stop default conflicting web services
sudo systemctl stop apache2
sudo systemctl stop mysql

sudo systemctl disable mysql
sudo systemctl disable apache2

# Go to web application directory
cd /var/www/html

# Stop running processes
./vendor/bin/sail down

# Remove existing files before deployment
sudo rm -rf /var/www/html/*
sudo rm -rf /var/www/html/.*

# Clone the project
git clone git@github.com:naikibro/a-hoe-tatou.git .

# Build the project
cd /var/www/html
composer install
npm install
npm run build

# Launch Laravel Sail services
alias sail='[ -f sail ] && sh sail || sh vendor/bin/sail'
sail up -d

# Load schemas and database
vendor/bin/sail artisan migrate:fresh
vendor/bin/sail artisan db:seed --class=UserbaseDev
