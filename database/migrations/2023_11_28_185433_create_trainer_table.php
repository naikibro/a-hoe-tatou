<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trainer', function (Blueprint $table) {
            $table->id('trainer_id');
            $table->foreignId('user_id')->constrained(); // add foreign key constraint
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trainer');
    }
};
