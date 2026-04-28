<?php

namespace App\Console\Commands;

use App\Models\Article;
use Illuminate\Console\Command;

class PublishScheduledArticles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'articles:publish-scheduled';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Publish articles that have reached their scheduled publish time';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $count = Article::where('status', 'scheduled')
            ->where('scheduled_at', '<=', now())
            ->update([
                'status' => 'published',
                'published_at' => now(),
            ]);

        if ($count > 0) {
            $this->info("✅ Published {$count} scheduled article(s)");
        } else {
            $this->info('No articles to publish');
        }

        return Command::SUCCESS;
    }
}
