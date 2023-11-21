# A hoe tatou - Organize your Va'a team management
![](public/img/ressources/icon-240-dec.png)  
**@author :** Vaanaiki BROTHERSON aka Naiki  
**@date :** September 2023
### Links
**@github :** https://github.com/naikibro/a-hoe-tatou  
**@LinkedIn :** www.linkedin.com/in/naiki-brotherson987
***
## Synopsis
This app made with Laravel intends to help Va'a team trainers to manage their workflow    
The goal is to offer a solution to speed up organisation so that teams and trainers can focus less on organisation and more on winning races

## Product owner
This app has been ordered by the CNAM PF in the scope of the __NFE114__ course as an educational project

## Technical specifications and documentation

### Big thanks to all contributors !

***

# 1 - Setup environement
Clone the project
```zsh
git clone git@github.com:naikibro/a-hoe-tatou.git
```

Set all your environement variables
```zsh
cp .env .env.local
```
**/!\ Dont forget to specify all required values in the new .env.local file**

### Create aliases
```sh
alias sail='[ -f sail ] && sh sail || sh vendor/bin/sail'
```


# 2 - Launch services

## Launch docker services
```zsh
cd a_hoe_tatou/
```

```zsh
vendor/bin/sail artisan cache:clear
```


Launch Laravel server
```zsh
vendor/bin/sail up -d
```
# 3 - Load schemas and database

Load the migrations :

```zsh
vendor/bin/sail artisan migrate
```









