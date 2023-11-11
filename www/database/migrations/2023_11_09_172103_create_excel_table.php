<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('excel', function (Blueprint $table) {
            $table->id();
            $table->string('file_name', 40)->nullable();
            $table->mediumText('sheets')->nullable();
            $table->string('data_keys', 40)->nullable();
            $table->longText('data_values')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('excel');
    }
};
