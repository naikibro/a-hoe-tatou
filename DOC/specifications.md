# Project L3 - Proof of Concept - Specifications
![](ressources/icon-240-dec.png)
## Va'a Training Tracking Application - A Hoe Tatou
**Client : Va'a Team Coach**  
**Delivery Date :** UNDETERMINED

**@author :** Vaanaiki BROTHERSON aka Naiki  
**@date :** September 2023  
### Links
**@github :** https://github.com/naikibro/a-hoe-tatou
**@LinkedIn :** www.linkedin.com/in/naiki-brotherson987

***
## Objectives
1. Organize Va'a training sessions.
2. Organize team activities.
3. Foster team spirit, Tahoe.

## Success Criteria
* Achieve the aforementioned objectives.
* Implement all user stories.
* Deliver the project within the announced deadlines.
* Satisfy the client.
* Maintainability of the project.
* Project stability.
* Project security.
* Sufficient project performance.
* Compliance with legal standards regarding GDPR.

***
# Features
* Training management.
* Team management.
* Common chat service for teams.
* Training invitations management (Coach).
* Training registration management (Rower: FIFO).
* Attendance tracking at training sessions.
* Attendance tracking at workshops (Repair, Physical, Medical check-up, etc.).
* Performance tracking at training sessions (duration, speed, route, progress, etc.).
* Calendar dashboard with training invitations.
* Automatic rower invitations in case of an unfilled canoe (email, app, SMS).

# Use Case Diagrams - User Stories
Refer to the Jira board: [Jira Board](https://naikibro.atlassian.net/jira/software/projects/HT/boards/2)  
Consult the various [user stories](./documentation.md).

***
## Roles Definition
### Passive Users
* __Visitor__:
  * Does not have an account.
  * Is not logged in.
  * Is always redirected to a registration + login page.

* __Unregistered Rower__:
  * Has an account.
  * Is not registered in any team.

### Active Users
* __Registered Rower__:
  * Has an account.
  * Is registered in at least one crew and/or team.

* __Trainer__:
  * Has an account.
  * Is registered in at least one crew and/or team.
  * Is registered in the trainers' registry.

* __Team Manager__:
  * Has an account.
  * Is registered in at least one crew and/or team.
  * Is registered in the team leaders' registry.
  * On creation of Team, the creator is assigned to both Trainer and Team managers roles

> **CAUTION!**: A user can be both a Rower, Trainer, and Manager for multiple crews (roles are specific to crews).

***
# Glossary

### Va'a
Polynesian canoe.
> **Te amo nei au ta'u va'a**: I carry my va'a.

### Hoe
To paddle.
> **A hoe tatou!**: Let's paddle!

### Ho'e
One (1), unified.
> **A ho'e tatou!**: We are one!

### Tahoe
Team spirit, group spirit, unity.
I entrust my life and future to my group and trust them.
We take care of each other and work for everyone's happiness.
> **Te tahoe nei tatou noa atu te mau vave'a**: We remain united despite the obstacles.

### Rower
Potential member of a va'a team.

### Team
A group of 1 to 6 individuals (ideally) practicing paddling on a va'a regularly.

A crew will have at least one steerer or "peperu."
A crew is considered complete when 6 rowers are available.

### Practice Team
Temporary crew (borrowed rowers, etc.).

### Practice
EN: Va'a training session.

Practice (noun) - as in the act of repeatedly doing something to improve skills or performance:

Pratique (noun): This is the direct translation of "practice" in the context of skill development. For example, "I need more practice" would be translated as "J'ai besoin de plus de pratique" in French.

Practice (verb) - as in the act of doing something repeatedly:

Pratiquer (verb): This is the verbal form of "practice." For example, "I practice yoga" would be translated as "Je pratique le yoga" in French.

### Training
Represents any type of training related to a team and/or va'a.
A training may not take place on the water, e.g., physical training, jogging, etc.

### Scrum
An Agile project management methodology that emphasizes collaboration, communication, and incremental delivery. Scrum is often used in software development and organizes work into short sprints to deliver features quickly.

### Laravel
An open-source web development framework written in PHP. Laravel simplifies the process of building web applications by providing ready-to-use tools and features, including database management, security, and session handling.

### Model-View-Controller (MVC)
A commonly used architectural pattern in software development that separates an application into three main components: the model (managing data and logic), the view (managing the user interface), and the controller (managing interactions between the model and view).

### Docker
A containerization platform that allows developers to create, deploy, and manage applications in containers. Docker containers offer lightweight isolation and portability between development and production environments.

### Composer
A dependency manager for PHP that makes it easy to install and manage PHP libraries and packages. Composer is widely used in modern PHP development to simplify dependency management.

### CRUD
CRUD is an acronym that stands for "Create, Read, Update, Delete." It represents a set of four basic operations used in data management:

__Create (C)__ - Create new data.
__Read (R)__ - Read or retrieve existing data.
__Update (U)__ - Update existing data.
__Delete (D)__ - Delete existing data.

### Specification
A specification is a document that describes in detail the requirements, features, performance, and other characteristics of a system, software, or product. It serves as a basis for the design, development, and testing of the subject being documented.

### Requirements
A requirement is a statement that specifies what a system, software, or product should do or how it should behave. Requirements are used to define the functionality and behavior of the subject being developed.

### User Stories
User stories are short, simple descriptions of a feature or functionality of a system, software, or product. They are written from the perspective of an end user to capture the user's needs and expectations.

### CNAM PF (Conservatoire National des Arts et Métiers - Formation Professionnelle)
Une institution éducative en France qui offre une variété de programmes de formation professionnelle et continue dans divers domaines, y compris l'informatique et la technologie.

![](ressources/icon-240-dec.png)


