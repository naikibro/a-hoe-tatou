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
        Schema::create('activity_trainer', function (Blueprint $table) {
            $table->id();
            $table->unsignedBiginteger('activity_id')->unsigned();
            $table->unsignedBiginteger('trainer_id')->unsigned();

            $table->foreign('activity_id')->references('id')
                ->on('activity')->onDelete('cascade');
            $table->foreign('trainer_id')->references('trainer_id')
                ->on('trainer')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_trainer');
    }
};
