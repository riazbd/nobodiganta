<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Scheduled publishing was removed (no UI ever existed to set a publish time).
     * Drop the unused scheduled_at column and tighten the status constraint so it
     * no longer accepts 'scheduled'. No rows use it (verified empty before drop).
     */
    public function up(): void
    {
        // Safety: demote any stray scheduled rows to draft before tightening.
        DB::table('articles')->where('status', 'scheduled')->update(['status' => 'draft']);

        if (Schema::hasColumn('articles', 'scheduled_at')) {
            Schema::table('articles', function (Blueprint $table) {
                $table->dropColumn('scheduled_at');
            });
        }

        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_status_check');
            DB::statement("ALTER TABLE articles ADD CONSTRAINT articles_status_check CHECK (status IN ('draft','pending','published','archived'))");
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('articles', 'scheduled_at')) {
            Schema::table('articles', function (Blueprint $table) {
                $table->timestamp('scheduled_at')->nullable();
            });
        }

        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_status_check');
            DB::statement("ALTER TABLE articles ADD CONSTRAINT articles_status_check CHECK (status IN ('draft','pending','published','scheduled','archived'))");
        }
    }
};
