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
        Schema::create('device_data', function (Blueprint $table) {
            $table->id();
            $table->decimal('battery_level', 5, 2)->default(85.00);
            $table->boolean('is_charging')->default(true);
            $table->decimal('current_output', 8, 2)->default(102.80);
            $table->decimal('temperature', 5, 2)->default(26.00);
            $table->decimal('humidity', 5, 2)->default(58.00);
            $table->integer('uv_index')->default(7);
            $table->decimal('wind_speed', 5, 2)->default(10.00);
            $table->string('rack_position')->default('extended');
            $table->boolean('auto_mode')->default(true);
            $table->boolean('connected')->default(true);
            $table->timestamp('last_update')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('device_data');
    }
};
