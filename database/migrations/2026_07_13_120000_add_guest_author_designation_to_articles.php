<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->string('guest_author_designation_bn')->nullable()->after('guest_author_name_en');
            $table->string('guest_author_designation_en')->nullable()->after('guest_author_designation_bn');
        });
    }

    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->dropColumn(['guest_author_designation_bn', 'guest_author_designation_en']);
        });
    }
};
