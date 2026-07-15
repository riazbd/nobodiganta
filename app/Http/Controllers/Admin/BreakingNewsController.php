<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendBreakingPush;
use App\Models\Article;
use App\Models\BreakingNews;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BreakingNewsController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->user()->hasPermission('news.breaking')) {
            abort(403);
        }

        $items = BreakingNews::with(['article:id,title_bn,title_en', 'creator:id,name'])
            ->ordered()
            ->get()
            ->map(fn($b) => $this->mapItem($b));

        // Bucket for the admin tabs.
        $now = now();
        $bucketed = [
            'active'    => $items->filter(fn($i) => $i['isActive'] && !$i['isScheduled'] && !$i['isExpired'])->values(),
            'scheduled' => $items->filter(fn($i) => $i['isActive'] && $i['isScheduled'])->values(),
            'expired'   => $items->filter(fn($i) => !$i['isActive'] || $i['isExpired'])->values(),
        ];

        return Inertia::render('features/admin/pages/content/BreakingNews', [
            'items' => $bucketed,
        ]);
    }

    public function store(Request $request)
    {
        if (!$request->user()->hasPermission('news.review')) {
            abort(403);
        }

        $v = $this->validateItem($request);
        $v['created_by'] = $request->user()->id;
        $item = BreakingNews::create($v);
        $this->maybeQueuePush($item);

        return back()->with('success', 'Breaking item created');
    }

    public function update(Request $request, BreakingNews $breaking)
    {
        if (!$request->user()->hasPermission('news.review')) {
            abort(403);
        }

        $breaking->update($this->validateItem($request));
        $this->maybeQueuePush($breaking->fresh());

        return back()->with('success', 'Breaking item updated');
    }

    public function destroy(Request $request, BreakingNews $breaking)
    {
        if (!$request->user()->hasPermission('news.review')) {
            abort(403);
        }

        $this->syncArticleFlag($breaking, false);
        $breaking->delete();

        return back()->with('success', 'Breaking item deleted');
    }

    /** Expire (retire) an item immediately. */
    public function expire(Request $request, BreakingNews $breaking)
    {
        if (!$request->user()->hasPermission('news.review')) {
            abort(403);
        }

        $breaking->update(['is_active' => false, 'expires_at' => now()]);
        $this->syncArticleFlag($breaking, false);

        return back()->with('success', 'Breaking item expired');
    }

    /** Reactivate an expired/retired item. */
    public function reactivate(Request $request, BreakingNews $breaking)
    {
        if (!$request->user()->hasPermission('news.review')) {
            abort(403);
        }

        $hours = BreakingNews::defaultExpiryHours();
        $breaking->update([
            'is_active'  => true,
            'expires_at' => $hours > 0 ? now()->addHours($hours) : null,
        ]);
        $this->syncArticleFlag($breaking, true);
        $this->maybeQueuePush($breaking->fresh());

        return back()->with('success', 'Breaking item reactivated');
    }

    /**
     * Keep a linked article's is_breaking flag in step with its breaking item,
     * so the All-News chip reflects reality and a re-save can't resurrect a
     * retired item. Uses a mass update to avoid re-triggering the observer.
     */
    private function syncArticleFlag(BreakingNews $breaking, bool $value): void
    {
        if ($breaking->article_id) {
            Article::where('id', $breaking->article_id)->update(['is_breaking' => $value]);
        }
    }

    /**
     * Queue a one-time web-push for a breaking item when it's push-enabled, live,
     * and hasn't been pushed yet. Scheduled items are delayed until their start.
     */
    private function maybeQueuePush(BreakingNews $b): void
    {
        // Web-push is implemented but kept dormant until explicitly enabled.
        if (!config('services.webpush.breaking_push_enabled')) {
            return;
        }
        if (!$b->push_enabled || $b->push_sent_at !== null || !$b->is_active) {
            return;
        }
        if ($b->expires_at && $b->expires_at->isPast()) {
            return;
        }

        $job = SendBreakingPush::dispatch($b->id);
        if ($b->starts_at && $b->starts_at->isFuture()) {
            $job->delay($b->starts_at);
        }
    }

    /** Drag-reorder: array of ids in display order. */
    public function reorder(Request $request)
    {
        if (!$request->user()->hasPermission('news.review')) {
            abort(403);
        }

        $ids = $request->validate(['ids' => 'required|array', 'ids.*' => 'integer'])['ids'];
        $count = count($ids);
        foreach ($ids as $i => $id) {
            BreakingNews::where('id', $id)->update(['priority' => $count - $i]);
        }

        return back()->with('success', 'Reordered');
    }

    private function validateItem(Request $request): array
    {
        $v = $request->validate([
            'articleId' => 'nullable|exists:articles,id',
            'headlineBn' => 'nullable|string|max:255',
            'headlineEn' => 'nullable|string|max:255',
            'link' => 'nullable|string|max:255',
            'severity' => 'required|in:just_in,breaking,urgent,live',
            'priority' => 'integer',
            'isPinned' => 'boolean',
            'edition' => 'required|in:bn,en,both',
            'startsAt' => 'nullable|date',
            'expiresAt' => 'nullable|date|after:startsAt',
            'isActive' => 'boolean',
            'pushEnabled' => 'boolean',
        ]);

        // A standalone item needs a headline; a linked one falls back to the article title.
        if (empty($v['articleId']) && empty($v['headlineBn']) && empty($v['headlineEn'])) {
            abort(422, 'A standalone breaking item needs a headline.');
        }

        return [
            'article_id' => $v['articleId'] ?? null,
            'headline_bn' => $v['headlineBn'] ?? null,
            'headline_en' => $v['headlineEn'] ?? null,
            'link' => $v['link'] ?? null,
            'severity' => $v['severity'],
            'priority' => $v['priority'] ?? 0,
            'is_pinned' => $v['isPinned'] ?? false,
            'edition' => $v['edition'],
            'starts_at' => $v['startsAt'] ?? null,
            'expires_at' => $v['expiresAt'] ?? null,
            'is_active' => $v['isActive'] ?? true,
            'push_enabled' => $v['pushEnabled'] ?? false,
        ];
    }

    private function mapItem(BreakingNews $b): array
    {
        $now = now();
        return [
            'id' => $b->id,
            'articleId' => $b->article_id,
            'articleTitle' => $b->article?->title_bn,
            'headlineBn' => $b->headline_bn,
            'headlineEn' => $b->headline_en,
            'title' => $b->headline_bn ?: $b->article?->title_bn ?: $b->headline_en,
            'link' => $b->link,
            'severity' => $b->severity,
            'priority' => $b->priority,
            'isPinned' => $b->is_pinned,
            'edition' => $b->edition,
            'startsAt' => $b->starts_at?->toIso8601String(),
            'expiresAt' => $b->expires_at?->toIso8601String(),
            'isActive' => $b->is_active,
            'isScheduled' => $b->starts_at && $b->starts_at->isFuture(),
            'isExpired' => $b->expires_at && $b->expires_at->isPast(),
            'pushEnabled' => $b->push_enabled,
            'pushSentAt' => $b->push_sent_at?->toIso8601String(),
            'views' => $b->views,
            'clicks' => $b->clicks,
            'creator' => $b->creator?->name,
            'createdAt' => $b->created_at?->toIso8601String(),
        ];
    }
}
