<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->json('popup_config')->nullable()->after('code');
        });

        // Backfill existing popup ad(s) with a safe default so they stop being aggressive.
        $default = [
            'triggers' => [
                'delay'          => ['enabled' => true,  'seconds' => 3],
                'scroll'         => ['enabled' => false, 'percent' => 50],
                'exit_intent'    => ['enabled' => false],
                'min_page_views' => ['enabled' => false, 'count' => 2],
            ],
            'frequency' => [
                'max_shows'  => ['enabled' => true,  'count' => 1, 'per' => 'session'],
                'cooldown'   => ['enabled' => false, 'minutes' => 30],
                'on_dismiss' => ['enabled' => false, 'hours' => 24],
                'on_click'   => ['enabled' => false, 'days' => 7],
            ],
            'targeting' => ['pages' => 'all', 'devices' => 'all'],
        ];
        DB::table('ads')->where('position', 'popup')->update(['popup_config' => json_encode($default)]);
    }

    public function down(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->dropColumn('popup_config');
        });
    }
};
