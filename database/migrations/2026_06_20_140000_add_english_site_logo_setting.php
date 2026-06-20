<?php

use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Add the English-edition logo setting without touching any existing
     * settings (firstOrCreate — safe on production).
     */
    public function up(): void
    {
        Setting::firstOrCreate(
            ['key' => 'site_logo_en'],
            [
                'value' => null,
                'group' => 'general',
                'type' => 'image',
                'label_bn' => 'সাইট লোগো (ইংরেজি)',
                'label_en' => 'Site Logo (English)',
                'description_bn' => 'ইংরেজি সংস্করণের হেডারে প্রদর্শিত হবে। খালি রাখলে বাংলা লোগোই ব্যবহার হবে।',
                'description_en' => 'Shown in the English edition header. Falls back to the Bangla logo if left empty.',
                'is_public' => true,
            ]
        );
    }

    public function down(): void
    {
        Setting::where('key', 'site_logo_en')->delete();
    }
};
