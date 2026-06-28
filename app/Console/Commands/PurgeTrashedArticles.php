<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\AuditLog;
use App\Models\Setting;
use Illuminate\Console\Command;

class PurgeTrashedArticles extends Command
{
    protected $signature = 'articles:purge-trash';
    protected $description = 'Permanently delete trashed articles older than the configured trash_auto_purge_days window';

    public function handle(): int
    {
        $days = (int) Setting::get('trash_auto_purge_days', 0);

        if ($days <= 0) {
            $this->info('Trash auto-purge disabled (trash_auto_purge_days = 0).');
            return self::SUCCESS;
        }

        $query = Article::onlyTrashed()->where('deleted_at', '<=', now()->subDays($days));
        $count = $query->count();

        if ($count > 0) {
            $query->forceDelete();

            AuditLog::create([
                'user_id'     => null,
                'event'       => 'article.auto_purged',
                'description' => "Auto-purged {$count} trashed articles older than {$days} days",
                'ip_address'  => null,
                'user_agent'  => 'scheduler',
            ]);
        }

        $this->info("Auto-purged {$count} trashed articles older than {$days} days.");
        return self::SUCCESS;
    }
}
