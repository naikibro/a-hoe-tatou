#Projet L3 - Proof of concept
##Application de suivi des entrainements de Va'a - A hoe tatou
Client : Entraineur d'équipe de Va'a  

***
##objectif
Organiser les entrainements de Va'a  
Organiser l'activité d'une équipe  
Développer l'esprit d'équipe, le Taho'e
***
##Technos
Laravel PHP  
MySQL  
Containerizé sur image docker compose custom:
- php laravel v-.-.-
- mariadb v-.-.-
- phpmyadmin v-.-.-

Template à voir pour le côté Responsive
***
##Features
. Gestion des entrainements  
. Gestion des équipes  
. Gestion des invitations aux entrainements ( Entraineur )  
. Gestion des inscriptions aux entrainements ( Rameur : FIFO )  
. Suivi des présences aux entrainements  
. Suivi des présences aux ateliers ( Réparation, Physique, visite médicale... )  
. Suivi des performances aux entrainements ( durée, vitesse, parcours, évolution...)  
. Dashboard calendrier avec invitations aux entrainements  
. Invitation automatique des rameurs en cas de pirogue pas remplie
***
##Contraintes
. 1 peperu obligatoire à chaque entrainement
***
##Rôles et statuts
. équipe  
. - entraineur  
. -- rameur
***
##Matériel 
. V6
. Rame

possibilité de plusieurs vaa pour une équipe
***
***
***
#Base de donnée

##USER
INT uid,  
VARCHAR2 nom,    
VARCHAR2 prenom,    
INT age,  
PRIMARY KEY ('uid')

##TEAM
INT tid,  
VARCHAR2 t_name,  
VARCHAR2 t_desc,
PRIMARY_KEY ('tid')

##TRAINERS
INT tr_id,  
INT uid,  
PRIMARY KEY ('tr_id'),  
FOREIGN KEY uid REFERENCES user

##VAA
INT v_id,  
STRING v_name,  
PRIMARY KEY ('v_id'),  
FOREIGN KEY tr_id REFERENCES user

##PRACTICE_TEAM
INT pt_id,
INT v1_uid,  
INT v2_uid,  
INT v3_uid,  
INT v4_uid,  
INT v5_uid,  
INT v6_uid,
PRIMARY KEY ('uid'),
FOREIGN KEY v1_uid REFERENCES user

##PRACTICE
INT p_id,  
INT pt_id,
PRIMARY KEY ('p_id'),
FOREIGN KEY pt_id REFERENCES practice_team
