<?php
namespace App\Console\Commands;

use App\Models\Story;
use Illuminate\Console\Command;

class ExpireStories extends Command
{
    protected $signature = 'stories:expire';
    protected $description = 'Mark published stories as expired when their expires_at has passed';

    public function handle(): int
    {
        $count = Story::where('status', 'published')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->update(['status' => 'expired']);

        $this->info("Expired {$count} stories.");
        return self::SUCCESS;
    }
}
