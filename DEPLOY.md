# Deployment guide
This file breaks down all the steps and requirements used to deploy the ahoetatou app to the internet

***
## REQUIREMENTS
Your server must have these installed:
- php8.1.2
  - pdo_mysql
- docker
- composer V2

***

## connect to remote production server
```bash
ssh mycustomuserthatissecret@ahoetatou.com
```

**stop default conflicting web services**
````shell
sudo systemctl stop apache2
sudo systemctl stop mysql

sudo systemctl disable mysql
sudo systemctl disable apache2
````

**go to web application**
```bash
cd /var/www/html

# stop running processes
./vendor/bin/sail down
sudo rm -rf /var/www/html/*    # remove existing files before deployment
sudo rm -rf /var/www/html/.*    # remove existing hidden files before deployment
```

**Clone the project**
```bash
git clone git@github.com:naikibro/a-hoe-tatou.git
```

### file structure

web server should look like this:

var  
+-www  
...+-html  
......+-    All the files off my project

AND NOT LIKE THIS

var  
+-www  
...+-html  
......+-a-hoe-tatou  
.........+-    All the files off my project

### / ! \ Dont forget to set your .env variables / ! \
These are the important ones, you can leave the others as is
````shell
APP_NAME=Laravel
APP_ENV=production
APP_KEY=base64:CtIS5BR8jW2xJwcgC4lFCKADeYe0O67kRQoCQtNiL0s=
APP_DEBUG=true
APP_URL=http://ahoetatou.com
ASSET_URL=http://ahoetatou.com

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=a_hoe_tatou
DB_USERNAME=sail
DB_PASSWORD=password

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=ahoetatou.webmaster@gmail.com
MAIL_PASSWORD=tdgzvaosmcccpmts
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS="ahoetatou.webmaster@gmail.com"
MAIL_FROM_NAME="${APP_NAME}"

````
***
## Build the project
**Install bundles**
````shell
composer install
````

**Install packages**
````shell
npm install

#npm run dev     # for local dev only
# OR
npm run build   # for production only
````

**launch laravel sail services**
````shell
alias sail='[ -f sail ] && sh sail || sh vendor/bin/sail'
sail up -d
````
***
# Load schemas and database

Load the migrations :

```sh
vendor/bin/sail artisan migrate:fresh
```


Load the Seeders :
````sh
vendor/bin/sail artisan db:seed --class=UserbaseDev
````
