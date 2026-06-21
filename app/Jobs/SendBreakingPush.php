<?php

namespace App\Jobs;

use App\Models\BreakingNews;
use App\Models\PushSubscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

class SendBreakingPush implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $breakingId) {}

    public function handle(): void
    {
        $b = BreakingNews::with('article.category')->find($this->breakingId);

        // Once-only + still-eligible guards (re-checked at run time for scheduled sends).
        if (!$b || !$b->push_enabled || $b->push_sent_at !== null || !$b->is_active) {
            return;
        }
        if ($b->starts_at && $b->starts_at->isFuture()) {
            return;
        }
        if ($b->expires_at && $b->expires_at->isPast()) {
            return;
        }

        $public = config('services.webpush.vapid_public_key');
        $private = config('services.webpush.vapid_private_key');
        if (empty($public) || empty($private)) {
            Log::warning('SendBreakingPush skipped: VAPID keys not configured.');
            return; // leave push_sent_at null so it can fire once keys are set
        }

        $edition = $b->edition === 'en' ? 'en' : 'bn';
        $data = $b->toPublicArray($edition);
        $title = $data['title'];
        if (!$title) {
            return;
        }
        $url = $data['url'] ?: ($edition === 'en' ? '/en/breaking' : '/breaking');
        $emoji = in_array($b->severity, ['breaking', 'urgent'], true) ? '🔴 '
            : ($b->severity === 'live' ? '🟢 ' : '🔵 ');

        $subs = PushSubscription::active()->get();
        if ($subs->isEmpty()) {
            $b->update(['push_sent_at' => now()]);
            return;
        }

        $webPush = new WebPush([
            'VAPID' => [
                'subject' => config('services.webpush.vapid_subject'),
                'publicKey' => $public,
                'privateKey' => $private,
            ],
        ]);

        $payload = json_encode([
            'title' => $emoji . $title,
            'body' => '',
            'icon' => '/icons/icon-192.png',
            'badge' => '/icons/icon-192.png',
            'url' => $url,
            'tag' => 'breaking-' . $b->id,
            'requireInteraction' => $b->severity === 'urgent',
        ]);

        foreach ($subs as $sub) {
            $webPush->queueNotification(
                Subscription::create([
                    'endpoint' => $sub->endpoint,
                    'publicKey' => $sub->public_key,
                    'authToken' => $sub->auth_token,
                ]),
                $payload
            );
        }

        foreach ($webPush->flush() as $report) {
            if (!$report->isSuccess() && $report->isSubscriptionExpired()) {
                PushSubscription::where('endpoint', $report->getEndpoint())->update(['is_active' => false]);
            }
        }

        // Mark sent so it never fires twice.
        $b->update(['push_sent_at' => now()]);
    }
}
