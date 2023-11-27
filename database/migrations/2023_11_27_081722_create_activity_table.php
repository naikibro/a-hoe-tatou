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
        Schema::create('activity', function (Blueprint $table) {
            $table->id();
            $table->text('title');
            $table->text('description');
            $table->enum('type', ['cultural', 'repair', 'workshop', 'puhapa', 'spiritual', 'navigation', 'maintenance', 'cohesion', 'fun', 'special']);
            $table->time('duration');
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity');
    }
};
