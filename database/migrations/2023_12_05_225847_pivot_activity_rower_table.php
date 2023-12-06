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
        Schema::create('activity_rower', function (Blueprint $table) {
            $table->id();
            $table->unsignedBiginteger('activity_id')->unsigned();
            $table->unsignedBiginteger('rower_id')->unsigned();

            $table->foreign('activity_id')->references('id')
                ->on('activity')->onDelete('cascade');
            $table->foreign('rower_id')->references('rower_id')
                ->on('rowers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_rower');
    }
};
