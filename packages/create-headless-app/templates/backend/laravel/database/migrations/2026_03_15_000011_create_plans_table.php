<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->integer('price_monthly')->default(0); // cents
            $table->integer('price_yearly')->default(0);  // cents
            $table->json('features')->nullable(); // string[]
            $table->json('limits')->nullable();   // {maxMembers, maxProjects, maxStorage, apiCallsPerMonth}
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
