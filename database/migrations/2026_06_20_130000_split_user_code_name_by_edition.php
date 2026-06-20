<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'code_name') && !Schema::hasColumn('users', 'code_name_bn')) {
                $table->renameColumn('code_name', 'code_name_bn');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'code_name_bn')) {
                $table->string('code_name_bn')->nullable()->after('name');
            }
            if (!Schema::hasColumn('users', 'code_name_en')) {
                $table->string('code_name_en')->nullable()->after('code_name_bn');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'code_name_en')) {
                $table->dropColumn('code_name_en');
            }
        });
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'code_name_bn')) {
                $table->renameColumn('code_name_bn', 'code_name');
            }
        });
    }
};
