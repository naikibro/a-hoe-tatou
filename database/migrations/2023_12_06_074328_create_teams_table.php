<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description');
            $table->timestamps();
        });

        // Add a column for the relationship to trainers
        Schema::create('team_trainers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained();
            $table->foreignId('trainer_id')->constrained('trainer', 'trainer_id'); // Assuming 'trainers' is the trainers table name
            $table->timestamps();
        });

        // Add a column for the relationship to rowers
        Schema::create('team_rowers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained();
            $table->foreignId('rower_id')->constrained('rowers', 'rower_id');
            $table->timestamps();
        });

        // Add a column for the relationship to activities
        Schema::create('team_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained();
            $table->foreignId('activity_id')->constrained('activity'); // Assuming 'activities' is the activities table name
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('team_activities');
        Schema::dropIfExists('team_rowers');
        Schema::dropIfExists('team_trainers');
        Schema::dropIfExists('teams');
    }
};
