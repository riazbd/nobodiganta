<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Session;

class ArticleMeter
{
    /**
     * Get the free monthly article limit from settings
     */
    public static function getLimit(): int
    {
        return (int) Setting::get('free_article_limit', 10);
    }

    /**
     * Session key for article count
     */
    const SESSION_KEY = 'article_read_count';
    const SESSION_START_KEY = 'article_read_period_start';

    /**
     * Record an article view
     */
    public static function recordView(int $articleId): void
    {
        // Get already viewed articles this session
        $viewed = Session::get('viewed_articles', []);
        
        // Skip if already viewed
        if (in_array($articleId, $viewed)) {
            return;
        }

        // Add to viewed
        $viewed[] = $articleId;
        Session::put('viewed_articles', $viewed);

        // Check if we need to reset the monthly counter
        self::resetIfNewMonth();

        // Increment counter
        $count = Session::get(self::SESSION_KEY, 0);
        Session::put(self::SESSION_KEY, $count + 1);
    }

    /**
     * Get current article count for this period
     */
    public static function getCount(): int
    {
        self::resetIfNewMonth();
        return Session::get(self::SESSION_KEY, 0);
    }

    /**
     * Check if user has exceeded their monthly limit
     */
    public static function hasExceededLimit(): bool
    {
        return self::getCount() >= self::getLimit();
    }

    /**
     * Get remaining articles for this month
     */
    public static function getRemaining(): int
    {
        $count = self::getCount();
        return max(0, self::getLimit() - $count);
    }

    /**
     * Reset counter if new month
     */
    protected static function resetIfNewMonth(): void
    {
        $periodStart = Session::get(self::SESSION_START_KEY);
        $now = now();

        if (!$periodStart || $now->month !== $periodStart['month'] || $now->year !== $periodStart['year']) {
            // Reset for new month
            Session::put(self::SESSION_KEY, 0);
            Session::put(self::SESSION_START_KEY, [
                'month' => $now->month,
                'year' => $now->year,
            ]);
            Session::forget('viewed_articles');
        }
    }

    /**
     * Reset meter (after subscription purchase)
     */
    public static function reset(): void
    {
        Session::forget(self::SESSION_KEY);
        Session::forget(self::SESSION_START_KEY);
        Session::forget('viewed_articles');
    }
}
