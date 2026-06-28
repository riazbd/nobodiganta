<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\Setting;
use Illuminate\Console\Command;

class AutoArchiveArticles extends Command
{
    protected $signature = 'articles:auto-archive';
    protected $description = 'Archive published articles older than the configured auto_archive_days window';

    public function handle(): int
    {
        $days = (int) Setting::get('auto_archive_days', 0);

        if ($days <= 0) {
            $this->info('Auto-archive disabled (auto_archive_days = 0).');
            return self::SUCCESS;
        }

        $count = Article::where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now()->subDays($days))
            ->update(['status' => 'archived']);

        $this->info("Archived {$count} articles older than {$days} days.");
        return self::SUCCESS;
    }
}
