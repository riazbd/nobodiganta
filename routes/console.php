<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Expire stories whose expires_at has passed
Schedule::command('stories:expire')->hourly();

// Auto-archive published articles older than the configured window (daily; no-op when disabled)
Schedule::command('articles:auto-archive')->daily();

// Permanently delete trashed articles older than the configured window (daily; no-op when disabled)
Schedule::command('articles:purge-trash')->daily();
