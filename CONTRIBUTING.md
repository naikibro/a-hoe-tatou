# Most used commands

symfony entity == laravel model

##Table of content  
- [Create a Model-View-Controller](#1---create-a-model-view-controller)  
- [Persist a Model to the database](#2---persist-model-to-database)  
- [Create relations between Models](#3---create-relations-between-models)

## 1 - Create a Model-View-Controller
**Create model**
````sh
php artisan make:controller YourControllerName
````

**Define route for controller**  
  
Open the routes/web.php file and define your routes. Link these routes to the methods in your controller.
````php
use App\Http\Controllers\YourControllerName;

Route::get('/your-route', [YourControllerName::class, 'methodName']);
````

**Create Views**
````sh
php artisan make:view your-view-name
````

**Define Models Views**
````sh
php artisan make:model YourModelName
````
This will create a model file in the app directory. Define your database schema and relationships in this file.


## 2 - Persist Model to database
**Create migration**
````sh
php artisan make:migration create_your_table_name
````

Edit the generated migration file in the database/migrations directory to define your table structure.

**Database seeding - ( Optional )**
````sh
php artisan make:seeder YourSeederName
````
If you need sample data for testing, you can create seeders.   
Run the following command to generate a seeder:

**Run Migrations and Seeders**
````sh
vendor/bin/sail artisan migrate
````
If you created seeders, run the following command to populate the database with sample data:
````sh
vendor/bin/sail artisan db:seed --class=YourSeederName
````

### Rollback migrations
````sh
vendor/bin/sail artisan migrate:rollback
````
## 3 - Create relations between Models

To establish a **many-to-many relationship** between a User and Activity models, you'll need to create an **intermediate table** that will store the relationships between users and activities.   
Let's call this table user_activity.    
Here's how you can modify the models to define the many-to-many relationship:

  
**Update the User model:**
`````php
// app/Models/User.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Authenticatable
{
    // ... (existing code)

    /**
     * The activities that belong to the user.
     */
    public function activities()
    {
        return $this->belongsToMany(Activity::class, 'user_activity');
    }
}
`````
**Update the Activity model:**
`````php
// app/Models/ActivityController.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    // ... (existing code)

    /**
     * The users that belong to the activity.
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_activity');
    }
}
`````

**create migration for relation table**
`````sh
php artisan make:migration create_user_activity_table
`````

**define the migration to match your schema**
`````php
// database/migrations/{timestamp}_create_user_activity_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUserActivityTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_activity', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('activity_id')->constrained();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_activity');
    }
}
`````

**Run migrations to create the relation table**
`````sh
vendor/bin/sail artisan migrate
`````
